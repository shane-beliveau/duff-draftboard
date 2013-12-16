// Collections
Players = new Meteor.Collection("players");
Teams   = new Meteor.Collection("teams");
Draft   = new Meteor.Collection("draft");
Flashes = new Meteor.Collection("flashes");

// Client
if (Meteor.isClient) 
{
	// Templates
    Template.teams.teams = function () {
        return Teams.find({}, { sort: { order: 1 } });
    };

    Template.currentpick.picks = function () {
        return Draft.find({});
    };

    Template.players.qb = function () {
        return Players.find({ pos: "QB", drafted: "false" }, { sort: { "ranking": 1 } });
    };

    Template.players.rb = function () {
        return Players.find({ pos: "RB", drafted: "false" }, { sort: { "ranking": 1 } });
    };

    Template.players.wr = function () {
        return Players.find({ pos: "WR", drafted: "false" }, { sort: { "ranking": 1 } });
    };

    Template.players.te = function () {
        return Players.find({ pos: "TE", drafted: "false" }, { sort: { "ranking": 1 } });
    };

    Template.players.k = function () {
        return Players.find({ pos: "K", drafted: "false" }, { sort: { "ranking": 1 } });
    };

    Template.players.def = function () {
        return Players.find({ pos: "DEF", drafted: "false" }, { sort: { "ranking": 1 } });
    };

    Template.flashes.flashes = function () {
        return Flashes.find({});
    };

    // Events
    Template.players.events({
        'click ul.players li' : function() {

            if( confirm('Are you sure you want to draft ' + this.first_name + ' ' + this.last_name + '?') )
            {
                // Update the player collection to show the selected player as drafted
                var selected_player = this;

                Players.update( selected_player._id, { $set : { drafted: "true" } });

                selected_player = Players.findOne({ _id: selected_player._id });

                // Add the player to the appropriate team and determine the next
                // team in the draft order.
                Meteor.call('find_by_order', {}, function(error, team) {
                    Teams.update( team._id , { $push : { players: selected_player } });
                });

            }
        }
    });

	Template.navigation.events({
		
		'click #reset' : function() {
			if( confirm('Are you sure you want to reset the draft?') )
			{
				Meteor.call('reset_all');
			}
		}

	});
	
}

// Server
if (Meteor.isServer) 
{
	Meteor.startup(function () {

		Meteor.methods({

			load_defaults : function() {

				_.each( _Players, function(player) {
					Players.insert( player );
				});

				_.each( _Teams, function(team) {
					Teams.insert( team );
				});

				Draft.insert({
					pick 			: 1,
					round			: 1,
					overall			: 1,
					team_pick		: 1,
					total_rounds	: 18,
					total_teams		: Teams.find().count()
				});

			},

			reset_all: function() {
				Players.remove({});
				Teams.remove({});
				Draft.remove({});
				Flashes.remove({});
				Meteor.call('load_defaults');
			},

			find_by_order: function() {

				var draft = Draft.findOne({}),
					team = Teams.findOne({ order: draft.team_pick });

				Meteor.call('determine_next_pick', draft);

				return team;
			},

			determine_next_pick: function(draft) {

				var overall   = draft.overall + 1,
					round     = Math.floor( ((overall - 1) / draft.total_teams) + 1 ),
					pick      = ((overall - 1) % draft.total_teams) + 1,
					team_pick = ( round % 2 ) ? pick : ( round * draft.total_teams ) - overall + 1;
				
				// Adjust picks for trades made in the league
	            if( round === 4 && team_pick === 12)
	            {
	                Flashes.insert({ message: 'Texas State Fighting Armadillos traded their 2nd round pick to Captain Morgan for M. Lynch. It is Captain Morgan\'s pick.' });
	                team_pick = 6;
	            }

	            if( (round === 5 && team_pick === 8) || (round === 6 && team_pick === 6) )
	            {
	                
	                if( round === 5 && team_pick === 8 )
	                {
	                	Flashes.insert({ message: 'Sugarbush Pitbulls traded their 3rd round pick to Baltimore Smack for R. Griffin III. It is Baltimore Smack\'s pick.' });
	                }

	                if( round === 6 && team_pick === 6 )
	                {
	                	Flashes.insert({ message: 'Captain Morgan traded their 4th round pick to Baltimore Smack for E. Decker. It is Baltimore Smack\'s pick.' });
	                }

	                team_pick = 4;
	            }

				Draft.update( draft._id, 
					{ $set : {
						round 		: round,
					    pick 		: pick,
					    team_pick 	: team_pick,
					    overall 	: overall
					}}, 
					function(error) {
						console.log(error);
					}
				);

			}

		});

		
	});
}