import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
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

UserModelSchema.pre("save", async function(next) {
  const usuario = this

  if (usuario.isModified("senha")) {
      const salt = await bcrypt.genSalt()
      const hash = await bcrypt.hash(usuario.senha, salt);

      usuario.senha = hash;
  }


  next()
});

const UserDefaultModel = mongoose.model("usersDefault", UserModelSchema);

export default UserDefaultModel;
