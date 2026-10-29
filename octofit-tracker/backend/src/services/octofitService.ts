import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) {
    throw Object.assign(new Error('Activity details are required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input;
  if (
    typeof userId !== 'string'
    || !Types.ObjectId.isValid(userId)
    || typeof teamId !== 'string'
    || !Types.ObjectId.isValid(teamId)
    || typeof type !== 'string'
    || type.trim().length === 0
    || typeof minutes !== 'number'
    || !Number.isFinite(minutes)
    || minutes <= 0
  ) {
    throw Object.assign(new Error('Activity details are invalid'), { status: 400 });
  }

  const userObjectId = new Types.ObjectId(userId);
  const teamObjectId = new Types.ObjectId(teamId);
  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userObjectId }),
    Team.exists({ _id: teamObjectId }),
  ]);
  if (!userExists || !teamExists) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userObjectId,
    team: teamObjectId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) {
    throw Object.assign(new Error('Team details are required'), { status: 400 });
  }

  const { name, mascot } = input;
  const members = input.members === undefined ? [] : input.members;
  if (
    typeof name !== 'string'
    || name.trim().length === 0
    || typeof mascot !== 'string'
    || mascot.trim().length === 0
    || !Array.isArray(members)
    || !members.every((member) => typeof member === 'string' && Types.ObjectId.isValid(member))
  ) {
    throw Object.assign(new Error('Team details are invalid'), { status: 400 });
  }

  const memberIds = members.map((member) => new Types.ObjectId(member));
  const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
  if (existingMembers !== memberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        let: { teamId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$team', '$$teamId'] } } },
          { $group: { _id: null, totalPoints: { $sum: '$points' } } },
        ],
        as: 'activityTotals',
      },
    },
    {
      $addFields: {
        totalPoints: { $ifNull: [{ $arrayElemAt: ['$activityTotals.totalPoints', 0] }, 0] },
      },
    },
    { $sort: { totalPoints: -1, name: 1 } },
    { $project: { _id: 0, teamName: '$name', totalPoints: 1 } },
  ]);
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('fitnessGoal').lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).select('type').lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.trim().toLowerCase();
  const activityType = recentActivity?.type.trim().toLowerCase();
  const goalMatchIndex = workouts.findIndex((workout) => workout.focus.trim().toLowerCase() === goal);
  const activityMatchIndex = activityType
    ? workouts.findIndex((workout) => workout.focus.trim().toLowerCase() === activityType)
    : -1;
  const preferredIndex = goalMatchIndex >= 0 ? goalMatchIndex : activityMatchIndex;
  const orderedWorkouts = preferredIndex >= 0
    ? [workouts[preferredIndex], ...workouts.filter((_, index) => index !== preferredIndex)]
    : workouts;
  const reason = goalMatchIndex >= 0
    ? `Recommended to support your ${user.fitnessGoal} goal.`
    : activityMatchIndex >= 0
      ? `Recommended based on your recent ${recentActivity?.type} activity.`
      : `Suggested as an available workout for your ${user.fitnessGoal} goal.`;

  return orderedWorkouts.map((workout, index) => ({
    ...workout,
    reason: index === 0 ? reason : 'Additional workout option.',
  }));
}

export { User };
