exports.up = async knex => {
  return knex.schema.createTable('user', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary()

    table.timestamp('created_time')
      .notNullable()
      .defaultTo(knex.fn.now())

    table.timestamp('updated_time')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table.string('email', 128)
      .notNullable()
      .unique()

    table.string('display_name', 32)
      .nullable()
      .defaultTo(null)

    table.string('password_hash', 256)
      .nullable()
      .defaultTo(null)

    table.boolean('email_verified')
      .notNullable()
      .defaultTo(false)

    table.string('recover_password_token', 40)
      .nullable()
      .defaultTo(null)

    table.timestamp('recover_password_time')
      .nullable()
      .defaultTo(null)

    table.string('email_verify_token', 40)
      .nullable()
      .defaultTo(null)

    table.timestamp('email_verify_time')
      .nullable()
      .defaultTo(null)

    table.string('facebook_id', 64)
      .nullable()
      .defaultTo(null)
      .unique()

    table.string('google_id', 64)
      .nullable()
      .defaultTo(null)
      .unique()
  })
}

exports.down = async knex => {
  return knex.schema.dropTable('user')
}
