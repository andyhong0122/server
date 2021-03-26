const graphql = require("graphql");
const {replace} = require("lodash");
const _ = require("lodash");
// schema describes the graph on the structure of our data

// taking out GraphQLObjectType from 'graphql' package
const {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList} = graphql;

//dummy data
var movies = [
   {name: "Fellowship of the Ring", genre: "Fantasy", id: "1", directorId: "3"},
   {name: "The Two Towers", genre: "Fantasy", id: "2", directorId: "3"},
   {name: "Return of the King", genre: "Fantasy", id: "3", directorId: "3"},
   {name: "Interstellar", genre: "Sci-fi", id: "4", directorId: "1"},
   {name: "The Dark Knight", genre: "Action", id: "5", directorId: "1"},
   {name: "Memento", genre: "Thriller", id: "6", directorId: "1"}
];

var directors = [
   {name: "Christopher Nolan", age: 45, id: "1"},
   {name: "Andy Hong", age: 29, id: "2"},
   {name: "Peter Jackson", age: 53, id: "3"}
];

const MovieType = new GraphQLObjectType({
   name: "Movie",
   fields: () => ({
      id: {type: GraphQLID},
      name: {type: GraphQLString},
      genre: {type: GraphQLString},
      director: {
         type: DirectorType,
         // parent includes the object var movies (above), so it has access to the directorId
         resolve(parent, args) {
            console.log(parent);
            return _.find(directors, {id: parent.directorId});
         }
      }
   })
});

const DirectorType = new GraphQLObjectType({
   name: "Director",
   fields: () => ({
      id: {type: GraphQLID},
      name: {type: GraphQLString},
      age: {type: GraphQLInt},
      movies: {
         // list of movies
         type: new GraphQLList(MovieType),
         resolve(parent, args) {
            console.log(parent);
            // filters through the movies array, and looks for matching criteria, returns list of movies; ie, nested query
            return _.filter(movies, {directorId: parent.id});
         }
      }
   })
});

const RootQuery = new GraphQLObjectType({
   name: "RootQueryType",
   fields: {
      movie: {
         type: MovieType,
         // when someone queries, we expect some args
         args: {id: {type: GraphQLID}},
         resolve(parent, args) {
            // code to get data from db / other source
            return _.find(movies, {id: args.id});
         }
      },
      director: {
         type: DirectorType,
         args: {id: {type: GraphQLID}},
         resolve(parent, args) {
            return _.find(directors, {id: args.id});
         }
      },
      //query for list of movies; GET ALL
      movies: {
         type: new GraphQLList(MovieType),
         resolve(parent, args) {
            return movies;
         }
      },
      directors: {
         type: new GraphQLList(DirectorType),
         resolve(parent, args) {
            return directors;
         }
      },
   }
});

module.exports = new GraphQLSchema({
   query: RootQuery
});
