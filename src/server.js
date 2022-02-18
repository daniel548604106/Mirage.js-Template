// Welcome to the tutorial!
import {
  createServer,
  Model,
  hasMany,
  belongsTo,
  Factory,
  RestSerializer,
} from 'miragejs';

export default function () {
  createServer({
    serializers: {
      reminder: RestSerializer.extend({
        include: ['list'],
        embed: true,
      }),
    },
    // create a reminders collection for us in its in-memory database
    // there's a one-to-many relationship between lists and reminders (a list can have many reminders), so we'll use hasMany and belongsTo helpers to define this relationship.

    models: {
      list: Model.extend({
        reminders: hasMany(),
      }),
      reminder: Model.extend({
        list: belongsTo(),
      }),
    },

    // We can use Factory.extend(config) to pass in a config object, where the keys of the config object correspond to properties on our models.
    factories: {
      list: Factory.extend({
        name(i) {
          return `List ${i}`;
        },

        afterCreate(list, server) {
          server.createList('reminder', 5, { list });
        },
      }),

      reminder: Factory.extend({
        text(i) {
          return `Reminder ${i}`;
        },
      }),
    },

    //  Mirage by default starts out empty . We can use the seeds hook to seed Mirage with some initial data.
    seeds(server) {
      //   server.create('reminder');
      //   server.create('reminder');
      //   server.create('reminder');
      //   server.create('list', {
      //     reminders: server.createList('reminder', 5),
      //   });

      server.create('list', {
        name: 'Home',
        reminders: [server.create('reminder', { text: 'Do taxes' })],
      });
      server.create('list');

      // Combined with server.createList, we can now easily create many Reminders using our Factory definition
      server.createList('reminder', 100);

      let homeList = server.create('list', { name: 'Home' });
      server.create('reminder', { list: homeList, text: 'Do taxes' });

      let workList = server.create('list', { name: 'Work' });
      server.create('reminder', { list: workList, text: 'Visit bank' });
    },

    routes() {
      this.get('/api/lists', (schema, request) => {
        return schema.lists.all();
      });

      this.get('/api/lists/:id/reminders', (schema, request) => {
        let listId = request.params.id;
        let list = schema.lists.find(listId);

        return list.reminders;
      });

      // Get the latest reminder datas
      // The schema argument, which is the first argument passed into all route handlers, is the primary way you interact with Mirage's data layer.
      this.get('/api/reminders', (schema) => {
        return schema.reminders.all();
      });

      // If you inspect the response in the console, you'll even see that Mirage's data layer has automatically assigned auto-incrementing IDs to each new Reminder for us.
      this.post('/api/reminders', (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        console.log(attrs);

        return schema.reminders.create(attrs);
      });

      // We then use schema to find the corresponding reminder, and then call destroy() on it to remove it from Mirage's database.
      this.delete('/api/reminders/:id', (schema, request) => {
        let id = request.params.id;

        return schema.reminders.find(id).destroy();
      });
    },
  });
}
