exports.up = async knex => {
  return knex.schema.createTable('chara', table => {
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

    table.bigInteger('user_id')
      .unsigned()
      .notNullable()

    table.string('name', 16)
      .notNullable()
      .unique()

    table.text('bio')
      .nullable()
      .defaultTo(null)

    table.foreign('user_id').references('user.id')
      .onUpdate('restrict')
      .onDelete('cascade')
  })
}

exports.down = async knex => {
  return knex.schema.dropTable('chara')
}
