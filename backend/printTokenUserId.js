const jwt = require('jsonwebtoken');

// Replace with your actual JWT token string
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRiOGYwMjQ3YWFlNDI0YzFkYTA1NjIiLCJpYXQiOjE3NTkyOTU2MDIsImV4cCI6MTc1OTI5OTIwMn0.3FkO1f3uAmjuu-xP8P0TLY5x2IAlDSw3pIMsRNjpAUI';

try {
  const decoded = jwt.decode(token);
  console.log('User ID from token:', decoded.id || decoded._id);
  console.log('Decoded token:', decoded);
} catch (err) {
  console.error('Invalid token:', err.message);
}
