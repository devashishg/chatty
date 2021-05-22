import { model, Schema, ObjectId } from "mongoose"


const userSchema = new Schema({
	name: { type: String, required: true },
	email: {
		type: String,
		required: true,
		trim: true,
		index: true,
		unique: true,
	},
	key: { type: String, required: true },
});

userSchema.set("toJSON",{ virtuals: true })

export const userModel =  model("user", userSchema);
