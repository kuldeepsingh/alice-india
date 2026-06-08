import bcrypt from 'bcryptjs';

const users = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    hash: '$2b$10$9OebyVg9IpIidYBn09MuNeVWmOcbMhSVdypl290F2nBBESj9bfhei'
  },
  {
    email: 'kuldeep.singh.chahar@gmail.com', 
    password: 'test',
    hash: '$2b$10$t4fjo4bWDIXLUQRY2OlQSu0W7JZwhdeSzd0fYOCK2XzxMtbJ072yS'
  }
];

for (const user of users) {
  bcrypt.compare(user.password, user.hash, (err, result) => {
    console.log(`${user.email} / ${user.password}: ${result ? 'MATCH ✓' : 'NO MATCH ✗'}`);
  });
}
