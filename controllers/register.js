const handleRegister = async (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;

  // Validación básica
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }

  // Hash de contraseña
  const hash = bcrypt.hashSync(password);

  try {
    // Transacción
    const user = await db.transaction(async (trx) => {
      // Insert en tabla login
      const loginEmail = await trx('login')
        .insert({
          hash: hash,
          email: email,
        })
        .returning('email');

      // Insert en tabla users
      const newUser = await trx('users')
        .insert({
          email: loginEmail[0].email,   // Para Knex 1.0+
          name: name,
          joined: new Date(),
        })
        .returning('*');

      return newUser[0];
    });

    res.json(user);

  } catch (err) {
    console.error("Registration error:", err);
    res.status(400).json('unable to register');
  }
};

module.exports = {
  handleRegister,
};