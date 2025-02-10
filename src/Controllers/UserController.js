import UserDefaultModel from "../Models/UserDefaultModel.js";
import RefreshTokenModel from "../Models/RefreshTokenModel.js";
import formatExpiresAt from "../Utils/general/formatExpiresAt.js";
import { signSessionJwts, decodeRefreshToken } from "../Utils/general/jwt.js";
import {
  cookieAuthName,
  createCookieOptions,
  deleteCookieOptions,
} from "../Utils/general/CookieAuth.js";

class UserController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      let user = await UserDefaultModel.findOne({ email: req.body.email });

      if (!user) {
        user = await UserDefaultModel.create(req.body);
        await user.save();
      }

      const { createdAt, updatedAt, password: pass, ...tokenUserData } = user;
      const { accessToken, refreshToken } = signSessionJwts(tokenUserData._doc);
      const expiresAt = formatExpiresAt(process.env.REFRESH_TOKEN_EXPIRE);

      await RefreshTokenModel.create({
        user: user._id,
        token: refreshToken,
        expiresAt,
      });
      res
        .status(200)
        .cookie(cookieAuthName, refreshToken, createCookieOptions)
        .json({ accessToken });
    } catch (error) {
      res.status(500).json({ message: "Error at login", error: error.message });
    }
  }

  async read(req, res) {
    try {
      const { id } = req.params;
      const user = await UserDefaultModel.findById(id).select("-favoritesTrees");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error while fetching User", error: error.message });
    }
  }

  async readAll(req, res) {
    try {
      const user = await UserDefaultModel.find().select("-favoritesTrees");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error while fetching Users", error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id: _id } = req.params;
      const userFound = await UserDefaultModel.findById(_id);
      if (!userFound)
        return res.status(404).json({ message: "Usuário com id " + _id + " não encontrado!" });
      const user = await userFound.set(req.body).save();
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "ERRO", error: error.message });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const userFound = await UserDefaultModel.findById(id);
      if (!userFound) {
        return res.status(404).json({ message: "Usuário com id " + id + " não encontrado!" });
      }
      await userFound.deleteOne();
      res.status(200).json({
        mensagem: "Usuário com id " + id + " deletado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: "ERRO", error: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const oldRefreshToken = req.signedCookies[cookieAuthName];
      res.clearCookie(cookieAuthName, deleteCookieOptions);

      if (!oldRefreshToken) {
        return res.status(401).json({ message: "Token de refresh não fornecido" });
      }

      const decoded = await decodeRefreshToken(oldRefreshToken);
      const foundToken = await RefreshTokenModel.findOne({ token: oldRefreshToken }).exec();

      if (!foundToken) {
        const hackedUser = await UserModel.findOne({
          _id: decoded.userId,
        }).exec();

        await RefreshTokenModel.deleteMany({ user: hackedUser._id }).exec();
        return res.status(404).json({ message: "token reuse" });
      }
      const userId = foundToken.user._id.toString();
      if (userId != decoded.userId) return res.status(404).json({ message: "tampered token" });

      await foundToken.deleteOne();
      const {
        createdAt,
        updatedAt,
        password: pass,
        ...tokenUserData
      } = foundToken.user.toObject({ virtuals: true });

      const { accessToken, refreshToken } = signSessionJwts(tokenUserData);

      const expiresAt = formatExpiresAt(process.env.REFRESH_TOKEN_EXPIRE);
      await RefreshTokenModel.create({
        user: userId,
        token: refreshToken,
        expiresAt,
      });

      res
        .cookie(cookieAuthName, refreshToken, createCookieOptions)
        .status(200)
        .json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar token", error: error.message });
    }
  }
  async logout(req, res) {
    try {
      const token = req.signedCookies[cookieAuthName];

      await RefreshTokenModel.findOneAndDelete({ token }).exec();

      return res.clearCookie(cookieAuthName, deleteCookieOptions).sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar token", error: error.message });
    }
  }
}

export default new UserController();
