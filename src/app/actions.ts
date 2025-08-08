'use server';

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { hashPassword, getCurrentUser, setUserSession, removeUserSession } from './_lib/auth';
import { redirect } from 'next/navigation';

interface UserProfile {
    name: string;
    email: string;
    resumeText?: string;
    profilePicUrl?: string;
    scores?: Record<string, number>;
    password?: string;
    _id?: ObjectId;
}

export type ProfileUpdateData = {
    email: string;
    resumeText: string;
    profilePicUrl: string;
    name: string;
};

type SkillScores = Record<string, number>;

const defaultScores: SkillScores = {
    "Communication": 0,
    "Technical": 0,
    "Problem Solving": 0,
    "Leadership": 0,
    "Project Mgmt": 0,
    "Teamwork": 0,
};

async function getDb() {
    const client = await clientPromise;
    return client.db('careerboost');
}

export async function signupUser(data: { name: string; email: string; password: string }) {
    const db = await getDb();
    
    const existingUser = await db.collection('users').findOne({ email: data.email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const result = await db.collection('users').insertOne({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        profilePicUrl: '',
        resumeText: '',
        scores: defaultScores,
    });

    await setUserSession(result.insertedId.toString());
}

export async function loginUser(data: { email: string; password: string }) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ email: data.email });

    if (!user || user.password !== await hashPassword(data.password)) {
        throw new Error('Invalid email or password');
    }

    await setUserSession(user._id.toString());
}

export async function logoutUser() {
    await removeUserSession();
    redirect('/');
}

export async function getUserProfile() {
    const userId = await getCurrentUser();
    if (!userId) {
        return null;
    }

    const db = await getDb();
    const user = await db.collection('users').findOne<UserProfile>(
        { _id: new ObjectId(userId) }
    );
    
    if (!user) {
        return null;
    }

    return {
        name: user.name,
        email: user.email,
        profilePicUrl: user.profilePicUrl || '',
        resumeText: user.resumeText || '',
    };
}

export async function updateUserProfile(data: ProfileUpdateData) {
    const userId = await getCurrentUser();
    if (!userId) {
        redirect('/');
    }

    const db = await getDb();
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
            $set: {
                name: data.name,
                email: data.email,
                resumeText: data.resumeText,
                profilePicUrl: data.profilePicUrl
            }
        }
    );
}

export async function getUserScores() {
    const userId = await getCurrentUser();
    if (!userId) {
        redirect('/');
    }

    const db = await getDb();
    const user = await db.collection('users').findOne<UserProfile>(
        { _id: new ObjectId(userId) }
    );
    
    return user?.scores || defaultScores;
}

export async function updateUserScores(newScores: SkillScores) {
    const userId = await getCurrentUser();
    if (!userId) {
        redirect('/');
    }

    const db = await getDb();
    const user = await db.collection('users').findOne<UserProfile>(
        { _id: new ObjectId(userId) }
    );
    
    if (!user) {
        throw new Error('User not found');
    }

    const currentScores = user.scores || defaultScores;
    const updatedScores: SkillScores = {};

    for (const skill in newScores) {
        updatedScores[skill] = Math.max(currentScores[skill] || 0, newScores[skill]);
    }

    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { scores: updatedScores } }
    );
}
