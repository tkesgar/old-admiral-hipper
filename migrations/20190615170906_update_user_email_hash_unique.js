exports.up = async knex => {
  return knex.schema.alterTable('user', table => {
    table.string('email_hash', 160)
      .notNullable()
      .unique()
      .alter()
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('user', table => {
    table.dropUnique('user')
  })
}
