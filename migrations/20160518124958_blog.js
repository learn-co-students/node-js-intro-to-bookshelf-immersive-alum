
exports.up = function(knex, Promise) {
  return knex.schema
    .createTableIfNotExists('users', (tbl) => {
      tbl.increments('id').primary();
      tbl.string('name');
      tbl.string('username');
      tbl.string('email');
      tbl.timestamps();
    })
    .createTableIfNotExists('posts', (tbl) => {
      tbl.increments('id').primary();
      tbl.string('title');
      tbl.string('body');
      tbl.integer('author').references('users.id');
      tbl.timestamps();
    })
    .createTableIfNotExists('comments', (tbl) => {
      tbl.increments('id').primary();
      tbl.string('body');
      tbl.integer('user_id').references('users.id');
      tbl.integer('post_id').references('posts.id');
      tbl.timestamps();
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('comments')
    .dropTable('posts')
    .dropTable('users');
};
