import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
  nome: {
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
  senha: {
    type: String,
    select: false,
  },
  type: {
    type: Boolean,
    required: false,
    default: false,
  },
  id_certificates: {
    type: Schema.Types.ObjectId,
    ref: "certificates",
    required: false,
  },
});

const UserDefaultModel = mongoose.model("usersDefault", UserModelSchema);

export default UserDefaultModel;
