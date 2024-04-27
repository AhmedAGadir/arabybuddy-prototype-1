import { Schema, Types, model, models } from "mongoose";

export interface ITransaction extends Document {
	createdAt?: Date; // Optional because it's provided by default
	stripeId: string;
	amount: number;
	plan?: string; // Optional because it's not marked as required
	credits?: number; // Optional because it's not marked as required
	buyer?: Types.ObjectId; // Optional because it's not marked as required, and it references another schema
}

const TransactionSchema = new Schema({
	createdAt: {
		type: Date,
		default: Date.now,
	},
	stripeId: {
		type: String,
		required: true,
		unique: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	plan: {
		type: String,
	},
	credits: {
		type: Number,
	},
	buyer: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
});

const Transaction =
	models?.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
