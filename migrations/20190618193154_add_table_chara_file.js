exports.up = async knex => {
  return knex.schema.createTable('chara_file', table => {
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

    table.bigInteger('chara_id')
      .unsigned()
      .notNullable()

    table.string('key', 64)
      .notNullable()

    table.bigInteger('file_id')
      .unsigned()
      .notNullable()

    table.unique(['chara_id', 'key'])

    table.foreign('chara_id').references('chara.id')
      .onUpdate('restrict')
      .onDelete('cascade')

    table.foreign('file_id').references('file.id')
      .onUpdate('restrict')
      .onDelete('cascade')
  })
}

exports.down = async knex => {
  return knex.schema.dropTable('chara_file')
}
