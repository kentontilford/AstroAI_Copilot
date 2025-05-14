import { NextRequest, NextResponse } from "next/server";
import {
  calculateNatalChart,
  calculateTransits,
  calculateCompositeChart,
} from "@/lib/astrology/ephemeris";
import { formatBirthProfileForCalculation } from "@/lib/astrology/utils";
import {
  generateDashboardInsight,
  generateFavorabilityRating,
} from "@/lib/openai/assistant";
import { prisma } from "@/lib/db/prisma";
import { secureHandler } from "@/lib/security";
import { dashboardRequestSchema } from "@/lib/validation";
import { z } from 'zod';
import { 
  withErrorHandling,
  AppError,
  AuthError,
  ValidationError,
  ResourceNotFoundError,
  AstrologyCalculationError,
  OpenAIError,
  DatabaseError
} from "@/lib/errors";
import { 
  withPermission, 
  withSubscription 
} from "@/lib/auth";
import { Permission } from "@/lib/auth/roles";
import { logDataAccess } from "@/lib/auth/audit";
import { AuditEventType } from "@/lib/auth/audit";

/**
 * Dashboard API handler with security measures and permission checks
 */
export const GET = secureHandler(
  withErrorHandling(
    withSubscription(
      async (req: NextRequest, context: any) => {
        // Auth context is provided by withSubscription middleware
        const { userId } = context.auth;
        
        // Get type from validated data or query parameters
        let type;
        
        // If we have validated data, use it
        if (context.validatedData) {
          type = context.validatedData.type;
        } else {
          // Otherwise, validate the query params
          const queryParams = new URLSearchParams(req.nextUrl.search);
          const result = dashboardRequestSchema.safeParse({ 
            type: queryParams.get("type") 
          });
          
          if (result.success) {
            type = result.data.type;
          } else {
            throw new ValidationError(
              "Valid dashboard type is required (personal_growth or relationships)",
              result.error.issues
            );
          }
        }

        // Get user with default profiles in a single optimized query
        const user = await prisma.user.findUnique({
          where: {
            clerk_user_id: userId,
            deleted_at: null // Ensure we only get non-deleted users
          },
          include: {
            // Include all profiles in a single query to avoid N+1 problems
            default_solo_profile: {
              where: { deleted_at: null } // Only include non-deleted profiles
            },
            default_relationship_profile_a: {
              where: { deleted_at: null }
            },
            default_relationship_profile_b: {
              where: { deleted_at: null }
            },
          },
        }).catch(error => {
          throw new DatabaseError("Failed to fetch user data", error);
        });

        if (!user) {
          throw new ResourceNotFoundError("User");
        }

        // Prepare response object
        let responseData: any = {
          dashboardType: type,
        };

        if (type === "personal_growth") {
          // Check permission for personal dashboard
          if (!await withPermission(Permission.VIEW_PERSONAL_DASHBOARD)) {
            throw new AuthError(
              "Insufficient permissions to access personal dashboard", 
              "insufficient_permissions"
            );
          }
          
          // Personal growth dashboard requires a solo profile
          if (!user.default_solo_profile) {
            throw new ResourceNotFoundError("Default solo profile", { code: "no_default_profile" });
          }

          const birthProfile = user.default_solo_profile;
          
          try {
            // Calculate natal chart and current transits
            const natalChartData = await calculateNatalChart(
              formatBirthProfileForCalculation(birthProfile)
            );
            
            const transitsData = await calculateTransits();

            // Format welcome message
            responseData.welcomeMessage = `Insights for ${birthProfile.profile_name}`;

            // Add natal chart and transit data to response
            responseData.natalPlacements = natalChartData.points;
            responseData.houses = natalChartData.houses;
            responseData.transitPlacements = transitsData.points;
            
            // Generate AI insights for cards
            const [birthChartInsight, transitOpportunity] = await Promise.all([
              generateDashboardInsight({
                insightType: 'birth_chart',
                chartData: natalChartData,
              }),
              generateDashboardInsight({
                insightType: 'transit_opportunity',
                chartData: natalChartData,
                transitsData: transitsData,
              }),
            ]).catch(error => {
              throw new OpenAIError("Failed to generate dashboard insights", error);
            });
            
            responseData.birthChartInsightCard = {
              title: birthChartInsight.title,
              summary_text: birthChartInsight.summary_text,
              modal_interpretation: birthChartInsight.modal_interpretation,
            };
            
            responseData.transitOpportunityCard = {
              title: transitOpportunity.title,
              summary_text: transitOpportunity.summary_text,
              modal_interpretation: transitOpportunity.modal_interpretation,
            };
            
            // Generate favorability ratings
            const favorabilityAreas = [
              { key: 'love', label: 'Love' },
              { key: 'career', label: 'Pro Success' },
              { key: 'finance', label: 'Finance' },
              { key: 'health', label: 'Health' },
              { key: 'personal_growth', label: 'Personal Growth' },
              { key: 'creativity', label: 'Creativity' },
            ];
            
            // Generate all favorability ratings in parallel
            const favorabilityPromises = favorabilityAreas.map(area => 
              generateFavorabilityRating({
                area: area.key as any,
                chartData: natalChartData,
                transitsData: transitsData,
              })
            );
            
            const favorabilityResults = await Promise.all(favorabilityPromises)
              .catch(error => {
                throw new OpenAIError("Failed to generate favorability ratings", error);
              });
            
            // Map results to response format
            responseData.favorabilityRatings = favorabilityAreas.map((area, index) => ({
              label: area.label,
              rating: favorabilityResults[index].rating,
              explanation: favorabilityResults[index].explanation,
            }));
            
            // Log dashboard access
            logDataAccess(
              AuditEventType.PROFILE_ACCESSED,
              "Dashboard",
              "personal_growth",
              { profile_id: birthProfile.id },
              req
            );
          } catch (error) {
            if (!(error instanceof AppError)) {
              throw new AstrologyCalculationError("Failed to calculate astrological data", error);
            }
            throw error;
          }
          
        } else {
          // Check permission for relationship dashboard
          if (!await withPermission(Permission.VIEW_RELATIONSHIP_DASHBOARD)) {
            throw new AuthError(
              "Insufficient permissions to access relationship dashboard", 
              "insufficient_permissions"
            );
          }
          
          // Relationships dashboard requires both relationship profiles
          if (!user.default_relationship_profile_a || !user.default_relationship_profile_b) {
            throw new ResourceNotFoundError(
              "Default relationship profiles", 
              { code: "no_default_relationship_profiles" }
            );
          }

          const profileA = user.default_relationship_profile_a;
          const profileB = user.default_relationship_profile_b;
          
          try {
            // Calculate composite chart and current transits
            const compositeChartData = await calculateCompositeChart(
              formatBirthProfileForCalculation(profileA),
              formatBirthProfileForCalculation(profileB)
            );
            
            const transitsData = await calculateTransits();

            // Format welcome message
            responseData.welcomeMessage = `Relationship Dynamics for ${profileA.profile_name} & ${profileB.profile_name}`;

            // Add composite chart and transit data to response
            responseData.compositePlacements = compositeChartData.points;
            responseData.houses = compositeChartData.houses;
            responseData.transitPlacements = transitsData.points;
            
            // Generate AI insights for cards
            const [compositeSynergy, relationalTransit] = await Promise.all([
              generateDashboardInsight({
                insightType: 'composite_synergy',
                chartData: compositeChartData,
              }),
              generateDashboardInsight({
                insightType: 'relational_transit',
                chartData: compositeChartData,
                transitsData: transitsData,
              }),
            ]).catch(error => {
              throw new OpenAIError("Failed to generate relationship insights", error);
            });
            
            responseData.compositeSynergyCard = {
              title: compositeSynergy.title,
              summary_text: compositeSynergy.summary_text,
              modal_interpretation: compositeSynergy.modal_interpretation,
            };
            
            responseData.relationalTransitCard = {
              title: relationalTransit.title,
              summary_text: relationalTransit.summary_text,
              modal_interpretation: relationalTransit.modal_interpretation,
            };
            
            // Generate favorability ratings
            const favorabilityAreas = [
              { key: 'harmony', label: 'Harmony' },
              { key: 'communication', label: 'Communication' },
              { key: 'passion', label: 'Passion' },
              { key: 'shared_growth', label: 'Shared Growth' },
              { key: 'challenges', label: 'Challenges' },
              { key: 'support', label: 'Support' },
            ];
            
            // Generate all favorability ratings in parallel
            const favorabilityPromises = favorabilityAreas.map(area => 
              generateFavorabilityRating({
                area: area.key as any,
                chartData: compositeChartData,
                transitsData: transitsData,
                compositeData: compositeChartData,
              })
            );
            
            const favorabilityResults = await Promise.all(favorabilityPromises)
              .catch(error => {
                throw new OpenAIError("Failed to generate relationship favorability ratings", error);
              });
            
            // Map results to response format
            responseData.favorabilityRatings = favorabilityAreas.map((area, index) => ({
              label: area.label,
              rating: favorabilityResults[index].rating,
              explanation: favorabilityResults[index].explanation,
            }));
            
            // Log dashboard access
            logDataAccess(
              AuditEventType.PROFILE_ACCESSED,
              "Dashboard",
              "relationships",
              { profile_a_id: profileA.id, profile_b_id: profileB.id },
              req
            );
          } catch (error) {
            if (!(error instanceof AppError)) {
              throw new AstrologyCalculationError("Failed to calculate relationship astrological data", error);
            }
            throw error;
          }
        }

        // Return dashboard data
        return NextResponse.json(responseData);
      }
    )
  ),
  {
    // Add schema validation
    schema: dashboardRequestSchema,
    
    // Add rate limiting for heavy computation
    rateLimit: {
      type: 'heavyComputation',
      custom: {
        // Customize the limit
        limit: 30,
        windowSizeInSeconds: 60, // 30 requests per minute
      }
    },
    
    // No CSRF needed for GET requests
    csrfProtection: false,
    
    // Sanitize input
    sanitizeInput: true,
  }
);