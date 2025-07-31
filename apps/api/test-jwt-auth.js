const jwt = require('jsonwebtoken');

// Test de génération et vérification de token
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret';

// Token d'exemple (similaire à celui du frontend)
const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2Nzg5MGU3Yy1jZGU2LTRmODUtOWI3Zi01ZjhkNjE0NzJiZjkiLCJ1c2VybmFtZSI6InJhcGhwbHQiLCJlbWFpbCI6InJhcGhhZWwucGxhc3NhcnRAZ21haWwuY29tIiwiaWF0IjoxNzUzOTkyNDg3LCJleHAiOjE3NTQ1OTcyODd9.1n_Qnwdyo8LSeR2JE6WcsgLr5NKm-v4QSRETAs3lCWs';

console.log('🔍 Test de vérification JWT...');
console.log('JWT_SECRET:', JWT_SECRET);
console.log('Token à tester:', testToken);

try {
  // Vérifier le token
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('✅ Token valide !');
  console.log('Payload décodé:', decoded);
  console.log('User ID:', decoded.sub);
  console.log('Username:', decoded.username);
  console.log('Email:', decoded.email);
  console.log('Expiration:', new Date(decoded.exp * 1000));
} catch (error) {
  console.error('❌ Erreur de vérification JWT:', error.message);

  // Essayer avec différentes clés secrètes
  console.log('\n🔍 Test avec différentes clés secrètes...');

  const testSecrets = [
    'default-jwt-secret',
    'your-secret-key',
    'quori-secret',
    'dev-secret',
  ];

  for (const secret of testSecrets) {
    try {
      const decoded = jwt.verify(testToken, secret);
      console.log(`✅ Token valide avec la clé: ${secret}`);
      console.log('User ID:', decoded.sub);
      break;
    } catch (e) {
      console.log(`❌ Échec avec la clé: ${secret}`);
    }
  }
}

// Générer un nouveau token de test
console.log("\n🔧 Génération d'un nouveau token de test...");
const newToken = jwt.sign(
  {
    sub: '67890e7c-cde6-4f85-9b7f-5f8d61472bf9',
    username: 'raphplt',
    email: 'raphael.plassart@gmail.com',
  },
  JWT_SECRET,
  { expiresIn: '7d' },
);

console.log('Nouveau token généré:', newToken);

// Vérifier le nouveau token
try {
  const decoded = jwt.verify(newToken, JWT_SECRET);
  console.log('✅ Nouveau token valide !');
  console.log('User ID:', decoded.sub);
} catch (error) {
  console.error('❌ Erreur avec le nouveau token:', error.message);
}
