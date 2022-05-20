import {
  readKey,
  decryptKey,
  readPrivateKey,
  encrypt,
  createMessage,
  readMessage,
  decrypt,
} from 'openpgp'; // use as CommonJS, AMD, ES6 module or via window.openpgp

(async () => {
  // put keys in backtick (``) to avoid errors caused by spaces or tabs
  const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----`;
  const privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----
...
-----END PGP PRIVATE KEY BLOCK-----`; // encrypted private key
  const passphrase = `yourPassphrase`; // what the private key is encrypted with

  const publicKey = await readKey({ armoredKey: publicKeyArmored });

  const privateKey = await decryptKey({
    privateKey: await readPrivateKey({ armoredKey: privateKeyArmored }),
    passphrase,
  });

  const encrypted = await encrypt({
    message: await createMessage({ text: 'Hello, World!' }), // input as Message object
    encryptionKeys: publicKey,
    signingKeys: privateKey, // optional
  });
  console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'

  const message = await readMessage({
    armoredMessage: encrypted, // parse armored message
  });
  const { data: decrypted, signatures } = await decrypt({
    message,
    verificationKeys: publicKey, // optional
    decryptionKeys: privateKey,
  });
  console.log(decrypted); // 'Hello, World!'
  // check signature validity (signed messages only)
  try {
    await signatures[0].verified; // throws on invalid signature
    console.log('Signature is valid');
  } catch (e) {
    throw new Error('Signature could not be verified: ' + e.message);
  }
})();
