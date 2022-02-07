import bcrypt from 'bcrypt';

const rawPassword = '';

bcrypt.hash(rawPassword, 10)
    .then(res => console.log(res));