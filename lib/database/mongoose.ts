import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
	conn: Mongoose | null;
	promise: Promise<Mongoose> | null;
}

// to avoid creating new connections for each request
// we will cache the connection
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
	cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
	if (cached.conn) {
		console.log("returning cached connection");
		return cached.conn;
	}

	if (!MONGODB_URL) {
		throw new Error(
			"Please define the MONGODB_URL environment variable inside .env.local"
		);
	}

	cached.promise =
		cached.promise ||
		mongoose.connect(MONGODB_URL, {
			dbName: "arabybuddy",
			bufferCommands: false,
		});

	cached.conn = await cached.promise;

	console.log("connected to database");

	return cached.conn;
};
