import CryptoJS from "crypto-js";

const merchantApi = "BLb0eIOjb8ApJhbdMtD56g%3D%3D";
const secretKey = "NGixn2NDe0G0ACaMHaT1URpR19nEqmQ4Rd0ZkylZUds%3D";

const encryptedBase64 = "CG0b0+Z5SEo+P4Feziu8MItWxjdUk+0ZS/1KaM99zVb8Za9RRvfVZilEyApf7lzJfu7BnkA/h3sUt4J2j5Vhc0xvxNiJXmdGsbjMr8SKZQDcIZDA2oxFZ+TlICbEPka7lLmzpIf0Borvnk2mNx1yOdert0H0ZwjpWK9Twy16xXs5D+5Kz2aJ0H/AxuGzdcge4gcOkLqpq8pnttzUqEotGPect3XV7cKrAjkQkqZWdTw7By2vJLvtYOqxQM7b9U2pgXlwzjdvOmLt4k6ItlSNnHd7QC2pSLKgq9i3k+CyogGPcU1Xrsq1lxoZvQnRAKiaJe3Q6mn4TNTiwQtBOij4Fzf32FN36gKOsaUhlCaoSYDZp4eJ6sPyk3tWa4u/6sC6I0AvRkj8wkKTQW87eUMDSqzCJPM1XXlIKEIotAxocqz20Psi7U0bYmGBWNd1LNv0aU9teNv8N0rcmisvhXvOGbO0bsWJyWGewJD7PCWkX08=";

const key = CryptoJS.SHA256(merchantApi);
const ivHex = CryptoJS.SHA256(secretKey).toString(CryptoJS.enc.Hex).substring(0, 32);
const iv = CryptoJS.enc.Hex.parse(ivHex);

const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedBase64);

const decrypted = CryptoJS.AES.decrypt(
  { ciphertext: encryptedBytes },
  key,
  {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }
);

const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
console.log("Decrypted:", plaintext);
