import axios from "axios";
import fs, { link } from "fs";
import https from "https";
import { v4 as uuidv4 } from "uuid";

class PixPayment {
  async create(req, res) {
    console.log("Iniciando criação de cobrança PIX...");

    //Certificado, Chave , ID, tudo que vem do dotenv
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const certPath = process.env.CERT_PATH; // certificado .crt
    const keyPath = process.env.KEY_PATH;   //chave privada .key

    // Autenticação mTLS
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    });

    try {
     
      console.log("token de autenticação...");
      
      
      const params = new URLSearchParams();
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);
      params.append("scope", "cob.write");
      params.append("grant_type", "client_credentials");



      console.log('Obtendo os search params')

      //DISGRAAAAAAAÇA
      const oauthResponse = await axios.post(
        "https://cdpj-sandbox.partners.uatinter.co/oauth/v2/token",/*Substituir pelo endereço que não eh do sandbox*/
        params,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          httpsAgent,
        }
      );

      const token = oauthResponse.data.access_token;
      console.log("Token de autenticação obtido:", token);

     
      console.log("Criando cobrança PIX...");
      const data = req.body;

      const payload = {
        calendario: {
          expiracao: 3600, //3600 segundos
        },
        devedor: {
          cnpj: data.cnpj || "12345678000195", // Substituir pelo CNPJ correto, se necessário
          nome: data.nome || "Cliente Exemplo",
        },
        valor: {
          original: data.transaction_amount.toFixed(2), // Valor da cobrança
        },
        chave: process.env.CHAVE_PIX, // Precisa-se dessa chave, só Deus sabe onde encontrar
        solicitacaoPagador: data.description || "Pagamento de serviço",
      };
      console.log("Vamo tentar aqui")
      const pixResponse = await axios.post(
        "https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob",/*Substituir pelo endereço que não eh do sandbox*/
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-conta-corrente": process.env.CONTA_CORRENTE, // Numero da conta corrente, soh deus sabe onde achar
          },
          httpsAgent,
        }
      );console.log("PIXRESPONSE", pixResponse.data.loc.location)

      // Retornar o link para o QR Code e o status da cobrança
      console.log("Cobrança criada ");
      return res.status(200).json({
        link: pixResponse.data.loc.location, // URL do QR Code Dinâmico      |
        txid: pixResponse.data.txid,        // ID da transação               |//CHATGPT  
        status: pixResponse.data.status,    // Status da cobrança            |
        
      }); 
    } catch (error) {
      console.error("Erro ao criar cobrança PIX:", error.response?.data || error.message);
      return res.status(400).json({
        message: "Erro ao criar cobrança PIX",
        error: error.response?.data || error.message,
      });

      
      
    } 
  } 
}

export default new PixPayment();
