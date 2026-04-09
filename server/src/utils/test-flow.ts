/**
 * Test script to verify the backend flow:
 * Login -> Create Scan -> Get Intent -> Pay -> Poll Results
 */

const BASE_URL = 'http://localhost:5000/api';

async function testFlow() {
  console.log('🚀 Starting Backend Flow Test...');

  try {
    // 1. Login
    console.log('\n[1/5] Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hacker@demo.com', password: 'Password123!' })
    });
    const loginData = await loginRes.json() as any;
    if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);
    const token = loginData.data.token;
    console.log('✅ Logged in successfully.');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Create Scan
    console.log('\n[2/5] Creating scan...');
    const scanRes = await fetch(`${BASE_URL}/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type: 'github', target: 'google/guava' })
    });
    const scanData = await scanRes.json() as any;
    if (!scanRes.ok) throw new Error(`Scan creation failed: ${scanData.message}`);
    const scanId = scanData.data.scanId;
    const cost = scanData.data.cost;
    console.log(`✅ Scan created. ID: ${scanId}, Cost: ${cost} XLM`);

    // 3. Get Payment Intent
    console.log('\n[3/5] Getting payment intent...');
    const intentRes = await fetch(`${BASE_URL}/pay/intent/${scanId}`, { headers });
    const intentData = await intentRes.json() as any;
    if (!intentRes.ok) throw new Error(`Intent failed: ${intentData.message}`);
    console.log(`✅ Payment Intent: Send ${intentData.data.amount} to ${intentData.data.destination} with memo ${intentData.data.memo}`);

    // 4. Pay for Scan
    console.log('\n[4/5] Paying for scan (Verifying mock Stellar TX)...');
    const payRes = await fetch(`${BASE_URL}/pay`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        scanId,
        amount: cost,
        transactionHash: `tx_${Math.random().toString(36).substring(7)}`
      })
    });
    const payData = await payRes.json() as any;
    if (!payRes.ok) throw new Error(`Payment failed: ${payData.message}`);
    console.log(`✅ Payment verified. Stellar Hash: ${payData.data.stellarHash}`);

    // 5. Poll Results
    console.log('\n[5/5] Polling for scan completion...');
    let attempts = 0;
    while (attempts < 10) {
      const resultRes = await fetch(`${BASE_URL}/results/${scanId}`, { headers });
      const resultData = await resultRes.json() as any;
      
      const status = resultData.data.status;
      console.log(`   Attempt ${attempts + 1}: Status is ${status}`);

      if (status === 'completed') {
        console.log('🎉 Scan completed successfully!');
        if (resultData.data && resultData.data.result) {
          console.log('📊 Severity:', resultData.data.result.severity);
          console.log('🛠 Vulnerabilities found:', resultData.data.result.vulnerabilities?.length || 0);
        } else {
          console.log('⚠️ Warning: result object is missing despite completion.');
        }
        console.log('✅ Test Passed!');
        return;
      }


      if (status === 'failed') {
        throw new Error('Scan failed in worker');
      }

      await new Promise(res => setTimeout(res, 3000));
      attempts++;
    }

    throw new Error('Test timed out waiting for scan completion');

  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    process.exit(1);
  }
}

testFlow();
