exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('users', (tbl) => {
        tbl.increments('id').primary();
        tbl.string('name');
        tbl.string('username');
        tbl.string('email');
        tbl.timestamps();
      }),
    knex.schema.createTableIfNotExists('posts', (tbl) => {
        tbl.increments('id').primary();
        tbl.string('title');
        tbl.string('body');
        tbl.string('author');        
        tbl.timestamps();
      }),
    knex.schema.createTableIfNotExists('comments', (tbl) => {
        tbl.increments('id').primary();
        tbl.string('body');
        tbl.integer('user_id').references('users.id');
        tbl.integer('post_id').references('posts.id');
        tbl.timestamps();
      })
  ]);
};

  exports.down = function(knex, Promise) {
    return Promise.all([
      knex.schema.dropTableIfExists('users'),
      knex.schema.dropTableIfExists('posts'),
      knex.schema.dropTableIfExists('comments')
      ]);
  }; 
