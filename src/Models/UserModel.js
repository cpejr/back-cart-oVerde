import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  imageURL: {
    type: String,
    required: false,
    trim: true,
  },
  type: {
    type: String,
    required: false,
    default: false,
  },
  id_Trees: {
    type: Schema.Types.UUID,
    ref: "trees",
    required: false,
  },
  id_certificates: {
    type: Schema.Types.UUID,
    ref: "certificates",
    required: false,
  },
});

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;