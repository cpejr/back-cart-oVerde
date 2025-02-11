import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const login = validateRequest({
    body: z.object({
        email: z.string({required_error: "O email é orbigatório"}).email("O email é inválido"),
        senha: z.string({required_error: "A senha é obrigatória"}),
    })
});

export default {
    login,
};