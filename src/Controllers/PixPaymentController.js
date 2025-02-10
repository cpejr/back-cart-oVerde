import axios from "axios";
import fs, { link } from "fs";
import https from "https";
import { v4 as uuidv4 } from "uuid";

class PixPayment {
  async create(req, res) {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const certPath = process.env.CERT_PATH;
    const keyPath = process.env.KEY_PATH;

    // Autenticação mTLS
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    });

    try {
      const params = new URLSearchParams();
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);
      params.append("scope", "cob.write");
      params.append("grant_type", "client_credentials");

      const oauthResponse = await axios.post(
        //That's the test enviroment adress, change it
        "https://cdpj-sandbox.partners.uatinter.co/oauth/v2/token",
        params,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          httpsAgent,
        }
      );

      const token = oauthResponse.data.access_token;

      const data = req.body;

      const payload = {
        calendario: {
          expiracao: 3600,
        },
        devedor: {
          cnpj: data.cnpj || "12345678000195",
          nome: data.nome || "Client",
        },
        valor: {
          original: data.transaction_amount.toFixed(2),
        },
        chave: process.env.CHAVE_PIX,
        solicitacaoPagador: data.description || "Payment",
      };

      //Creating payment
      const pixResponse = await axios.post(
        //That's the test enviroment adress, change it
        "https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-conta-corrente": process.env.CONTA_CORRENTE,
          },
          httpsAgent,
        }
      );

      // Return the link for the QR code

      return res.status(200).json({
        // Payment link
        link: pixResponse.data.loc.location,
        // Transation ID
        txid: pixResponse.data.txid,
        status: pixResponse.data.status,
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
