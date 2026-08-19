/**
 * checkPan.js
 *
 * Prompts the user for a PAN number, validates its format locally,
 * then calls the Income Tax e-portal API to determine whether the
 * PAN is:
 *   - valid & active
 *   - valid but belongs to a minor
 *   - valid but inactive
 *   - invalid
 *
 * Requires Node.js 18+ (uses the built-in global `fetch`).
 * Run with: node checkPan.js
 */

const readline = require('readline');

const API_URL = 'https://eportal.incometax.gov.in/iec/registrationapi/saveEntity';

// 5 letters, 4 digits, 1 letter e.g. LOOPS1234P
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Maps every known response "code" to the bucket it belongs to.
const CODE_MAP = {
  // --- PAN is valid ---
  EF01227: 'valid',   // PAN and Aadhaar are linked
  EF00048: 'valid',   // This PAN has already been registered

  // --- PAN is valid but minor ---
  EF00050: 'minor',   // Minor / legal guardian required

  // --- PAN is invalid ---
  EF30047: 'invalid', // PAN entered does not exist
  EF00047: 'invalid', // PAN entered does not exist. Please retry.
  EF00082: 'invalid', // Incorrect PAN, Please retry.

  // --- PAN is inactive ---
  EF30041: 'inactive',  // Inactive, contact Assessing Officer
  EF500102: 'inactive', // Inactive
  EF00254: 'inactive',  // Inactive, please check
};

// Final message shown to the user for each bucket.
const STATUS_MESSAGES = {
  valid: 'PAN is valid & active',
  minor: 'PAN is valid but of a minor',
  inactive: 'PAN is valid but inactive',
  invalid: 'PAN is invalid',
};

// Priority order used when a response contains multiple recognised codes.
// (Most specific / most "serious" classification wins.)
const PRIORITY = ['minor', 'inactive', 'invalid', 'valid'];

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim().toUpperCase());
    });
  });
}

async function callPanApi(panNumber) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      serviceName: 'checkPanDetailsService',
      userId: panNumber,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with HTTP status ${response.status}`);
  }

  return response.json();
}

function determinePanStatus(apiResponse) {
  const messages = Array.isArray(apiResponse.messages) ? apiResponse.messages : [];
  const codesPresent = messages.map((m) => m.code);
  const bucketsFound = new Set(
    codesPresent.map((code) => CODE_MAP[code]).filter(Boolean)
  );

  for (const bucket of PRIORITY) {
    if (bucketsFound.has(bucket)) return bucket;
  }

  return 'unknown';
}

async function main() {
  const panInput = await askQuestion('Enter PAN number: ');

  if (!PAN_REGEX.test(panInput)) {
    console.log(
      'Invalid PAN format. A PAN must be 10 characters: 5 letters, 4 digits, ' +
        '1 letter (e.g., LOOPS1234P).'
    );
    return;
  }

  try {
    const apiResponse = await callPanApi(panInput);
    const status = determinePanStatus(apiResponse);

    if (status === 'unknown') {
      console.log('Could not determine PAN status from a known code. Raw response:');
      console.log(JSON.stringify(apiResponse, null, 2));
    } else {
      console.log(STATUS_MESSAGES[status]);
    }
  } catch (err) {
    console.error('Error while checking PAN:', err.message);
  }
}

main();
