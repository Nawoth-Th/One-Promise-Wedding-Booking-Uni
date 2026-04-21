/**
 * @file statsController.ts
 * @description Logic for generating Business Intelligence (BI) reports.
 * Uses the Mongoose Aggregation Framework to transform raw booking data 
 * into actionable financial and operational metrics.
 * 
 * Featured Reports:
 * 1. Financial Performance: Revenue & Balances.
 * 2. Operational Insights: Booking trends & package popularity.
 * 3. Resource Metrics: Team utilization analysis.
 * 4. Spatial Analysis: Geographic & Venue frequency.
 */

import { Request, Response } from 'express';
import { Order } from './Order';
import { TeamMember } from '../team-location/TeamMember';
import mongoose from 'mongoose';

/**
 * @desc    Get system-wide statistics and reports
 * @route   GET /api/booking/stats/summary
 * @access  Private/Admin
 */
/**
 * @desc    Get system-wide statistics and reports.
 * @route   GET /api/booking/stats/summary
 * @access  Private/Admin
 * 
 * Logic: Executes multiple parallel-ish aggregation pipelines to provide
 * a holistic view of the studio's performance.
 */
export const getStatsSummary = async (req: Request, res: Response) => {
    try {
        // Report 01: Financial Performance
        // Logic: Filter out cancelled orders and sum up totals/balances.
        const financials = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$financials.totalAmount' },
                    totalBalance: { $sum: '$financials.balance' },
                    averageOrderValue: { $avg: '$financials.totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Logic: Group revenue by the month of the Order creation.
        const revenueByMonth = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    revenue: { $sum: '$financials.totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Report 02: Operational & Booking Insights
        // Feature: Market share analysis of specific packages.
        const packageDistribution = await Order.aggregate([
            { $match: { 'wedding.packageType': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$wedding.packageType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Feature: Service Mix (Quantifying work volume for different events)
        const eventTypeCounts = await Order.aggregate([
            {
                $project: {
                    hasWedding: { $cond: [{ $ifNull: ['$wedding.date', false] }, 1, 0] },
                    hasHomecoming: { $cond: [{ $ifNull: ['$homecoming.date', false] }, 1, 0] },
                    hasEngagement: { $cond: [{ $ifNull: ['$engagement.date', false] }, 1, 0] },
                    hasPreShoot: { $cond: [{ $ifNull: ['$preShoot.date', false] }, 1, 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    wedding: { $sum: '$hasWedding' },
                    homecoming: { $sum: '$hasHomecoming' },
                    engagement: { $sum: '$hasEngagement' },
                    preShoot: { $sum: '$hasPreShoot' }
                }
            }
        ]);

        // Report 03: Team & Resource Metrics
        // Logic: Transform the 'assignments' object into arrays to count staff frequency.
        const teamUtilization = await Order.aggregate([
            { $project: { allAssignments: { $objectToArray: '$assignments' } } },
            { $unwind: '$allAssignments' },
            { $unwind: '$allAssignments.v' },
            {
                $group: {
                    _id: '$allAssignments.v',
                    eventCount: { $sum: 1 }
                }
            },
            { $sort: { eventCount: -1 } },
            { $limit: 10 }
        ]);

        // Report 04: Geographic & Venue Analysis
        // Logic: Unwind the locations array to identify the most popular hotspots.
        const topVenues = await Order.aggregate([
            { $unwind: '$eventDetails.locations' },
            {
                $group: {
                    _id: '$eventDetails.locations.name',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            summary: financials[0] || { totalRevenue: 0, totalBalance: 0, averageOrderValue: 0, count: 0 },
            revenueByMonth,
            packageDistribution,
            eventTypes: eventTypeCounts[0] || { wedding: 0, homecoming: 0, engagement: 0, preShoot: 0 },
            teamUtilization,
            topVenues
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Error generating reports' });
    }
};
