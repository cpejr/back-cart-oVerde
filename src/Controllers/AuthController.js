import UserDefaultModel from "../Models/UserDefaultModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


class AuthController {
    async login(req, res) {
        try {
            const {email, senha} = req.body;
            
            const userFind = await UserDefaultModel.findOne({ email }).select("+senha");
            if(!userFind) 
                return res.status(403).json({message: "Email or password invalid"});
            
            const isMatch = await bcrypt.compare(senha, userFind.senha);

            if (!isMatch)
                return res.status(403).json({message: "Email or password invalid"})
            
            const {senha: hashedSenha, ...user} = userFind.toObject();
            
            const token = jwt.sign({user}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE_IN});

            res.status(200).json({token});
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }
}   
    

export default new AuthController();