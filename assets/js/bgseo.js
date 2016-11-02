( function ( $ ) {

	'use strict';

	/**
	 * Registers dashboard display as control.
	 *
	 * @since 1.4
	 */
	butterbean.views.register_control( 'dashboard', {
		// Wrapper element for the control.
		tagName : 'div',

		// Custom attributes for the control wrapper.
		attributes : function() {
			return {
				'id'    : 'butterbean-control-' + this.model.get( 'name' ),
				'class' : 'butterbean-control butterbean-control-' + this.model.get( 'type' )
			};
		},
		initialize : function() {
			$( window ).bind( 'bgseo-report', _.bind( this.getAnalysis, this ) );

			var type = this.model.get( 'type' );

			this.bgseo_template = wp.template( 'butterbean-control-dashboard' );

			// Bind changes so that the view is re-rendered when the model changes.
			_.bindAll( this, 'render' );
			this.model.bind( 'change', this.render );
		},
		getAnalysis: function( e, report ) {
			this.model.set( report );
		},

		// Renders the control template.
		render : function() {
			// Only render template if model is active.
			if ( this.model.get( 'active' ) )
				this.el.innerHTML = this.bgseo_template( this.model.toJSON() );
			return this;
		},
	});

})( jQuery );

( function ( $ ) {

	'use strict';

	/**
	 * Registers the keywords display as a control.
	 *
	 * @since 1.4
	 */
	butterbean.views.register_control( 'keywords', {
		// Wrapper element for the control.
		tagName : 'div',

		// Custom attributes for the control wrapper.
		attributes : function() {
			return {
				'id'    : 'butterbean-control-' + this.model.get( 'name' ),
				'class' : 'butterbean-control butterbean-control-' + this.model.get( 'type' )
			};
		},
		initialize : function() {
			$( window ).bind( 'bgseo-report', _.bind( this.getAnalysis, this ) );

			var type = this.model.get( 'type' );

			this.bgseo_template = wp.template( 'butterbean-control-keywords' );

			// Bind changes so that the view is re-rendered when the model changes.
			_.bindAll( this, 'render' );
			this.model.bind( 'change', this.render );
		},
		getAnalysis: function( e, report ) {
			this.model.set( report );
		},

		// Renders the control template.
		render : function() {
			// Only render template if model is active.
			if ( this.model.get( 'active' ) )
				this.el.innerHTML = this.bgseo_template( this.model.toJSON() );
			return this;
		},
	});

})( jQuery );

var BOLDGRID = BOLDGRID || {};
BOLDGRID.SEO = BOLDGRID.SEO || {};

( function ( $ ) {
	'use strict';

	var self;

	BOLDGRID.SEO.Admin = {
		/**
		 * Initialize Word Count.
		 *
		 * @since 1.2.1
		 */
		init : function () {
			$( document ).ready( function() {
				self._setWordCounts();
			});
		},

		/**
		 * Get the word count of a metabox field.
		 *
		 * @since 1.2.1
		 */
		wordCount : function( $element ) {
			var limit      = $element.attr( 'maxlength' ),
				$counter   = $( '<span />', {
					'class' : 'boldgrid-seo-meta-counter',
					'style' : 'font-weight: bold'
				}),
				$container = $( '<div />', {
					'class' : 'boldgrid-seo-meta-countdown boldgrid-seo-meta-extra',
					'html'  : ' characters left'
				});

			if ( limit ) {
				 $element
					.removeAttr( 'maxlength' )
					.after( $container.prepend( $counter ) )
					.on( 'keyup focus' , function() {
						self.setCounter( $counter, $element, limit );
					});
			}

			self.setCounter( $counter, $element, limit );
		},

		/**
		 * Set the colors of the count to reflect ideal lengths.
		 *
		 * @since 1.2.1
		 */
		setCounter : function( $counter, $target, limit ) {
			var text  = $target.val(),
			    chars = text.length;

			$counter.html( limit - chars );

			if ( chars > limit ) {
				$counter.css( { 'color' : 'red' } );
			} else if ( chars > 0 && chars < 30 ) {
				$counter.css( { 'color' : 'goldenrod' } );
			} else if ( chars > 29 ) {
				$counter.css( { 'color' : 'limegreen' } );
			} else {
				$counter.css( { 'color' : 'black' } );
			}
		},

		/**
		 * Set the word counts for each field in the SEO Metabox.
		 *
		 * @since 1.2.1
		 */
		_setWordCounts : function() {
			// Apply our wordcount counter to the meta title and meta description textarea fields.
			$( '#boldgrid-seo-field-meta_title, #boldgrid-seo-field-meta_description' )
				.each( function() {
					self.wordCount( $( this ) );
				});
		},
	};

	self = BOLDGRID.SEO.Admin;

})( jQuery );

BOLDGRID.SEO.Admin.init();

( function ( $ ) {
	'use strict';

	var self;

	BOLDGRID.SEO.TinyMCE = {
		/**
		 * Initialize TinyMCE Content.
		 *
		 * @since 1.2.1
		 */
		init : function () {
			self.onloadContent();
			self.generateReport();
			$( document ).ready( function() {
				self.editorChange();
			});
		},
		onloadContent: function() {
			var text,
				editor = $( '#content.wp-editor-area[aria-hidden=false]' );
			$( window ).on( 'load bgseo-media-inserted', function() {
				var content;

				if ( tinymce.ActiveEditor ) {
					content = tinyMCE.get( wpActiveEditor ).getContent();
				} else {
					content = $( '#content' ).val();
					content = content.replace( /\r?\n|\r/g, '' );
				}

				content = {
					'raw': content,
					'text': self.stripper( content.toLowerCase() ),
				};

				$( '#content' ).trigger( 'bgseo-analysis', [content] );
			});
		},
		editorChange: function() {
			var text, targetId;
			$( '#content.wp-editor-area' ).on( 'input propertychange paste nodechange', function() {
				targetId = $( this ).attr( 'id' );
				text = self.wpContent( targetId );
			});
			return text;
		},
		tmceChange: function( e ) {
			var text, targetId = e.target.id;
			text = self.wpContent( targetId );
			return text;
		},
		wpContent : function( targetId ) {
			var text = {};
			switch ( targetId ) {
				// Grab text from TinyMCE Editor.
				case 'tinymce' :
					// Only do this if page/post editor has TinyMCE as active editor.
					if ( tinymce.activeEditor )
						// Define text as the content of the current TinyMCE instance.
						text = tinyMCE.get( wpActiveEditor ).getContent();
					break;
				case 'content' :
					text = $( '#content' ).val();
					text = text.replace( /\r?\n|\r/g, '' );
					break;
			}
			text = {
				'raw': text,
				'text': self.stripper( text.toLowerCase() ),
			};

			$( '#content' ).trigger( 'bgseo-analysis', [text] );

		},
		// Strip out remaining traces of HTML to form our cleanText output to scan
		stripper: function( html ) {
			var tmp;
			tmp = document.implementation.createHTMLDocument( 'New' ).body;
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || " ";
		},
		generateReport : function() {
			var words,
				count,
				report = {};

			$( document ).on( 'bgseo-analysis', function( e, eventInfo ) {
				var titleLength = $( '#boldgrid-seo-field-meta_title' ).val().length,
				    descriptionLength = $( '#boldgrid-seo-field-meta_description' ).val().length;

				report.title = {
					length : titleLength,
					lengthScore:  BOLDGRID.SEO.Title.titleScore( titleLength ),
					keywordUsage : 0,
				};
				report.description = {
					length : descriptionLength,
					lengthScore:  BOLDGRID.SEO.Description.descriptionScore( descriptionLength ),
					keywordUsage : 0,
				};

				report.robotIndex = {
					lengthScore: BOLDGRID.SEO.Robots.indexScore(),
				};

				report.robotFollow = {
					lengthScore: BOLDGRID.SEO.Robots.followScore(),
				};

				if ( eventInfo ) {
					// Get WordPress' more acurate word counts.
					if ( ! _.isUndefined( eventInfo.count ) ) {
						report.wordCount = eventInfo.count;
						report.content = {
							length : eventInfo.count,
							lengthScore : BOLDGRID.SEO.ContentAnalysis.seoContentLengthScore( eventInfo.count ),
						};
					} else if ( eventInfo.count === 0 ) {
						report.content = {
							length : 0,
							lengthScore : BOLDGRID.SEO.ContentAnalysis.seoContentLengthScore( 0 ),
						};
					}

					// Listen for changes to raw HTML in editor.
					if ( eventInfo.raw ) {
						var raw = eventInfo.raw, imgLength;
						imgLength = $( raw ).find( 'img' ).length;

						report.rawstatistics = {
							'h1Count': $( raw ).find( 'h1' ).length,
							'h2Count': $( raw ).find( 'h2' ).length,
							'h3Count': $( raw ).find( 'h3' ).length,
							imageCount: imgLength,
						};
						report.image = {
							length : imgLength,
							lengthScore: BOLDGRID.SEO.ContentAnalysis.seoImageLengthScore( imgLength ),
						};
					}

					// Listen for changes to the actual text entered by user.
					if ( eventInfo.text ) {
						var customKeyword, content = eventInfo.text;
						words = textstatistics( content ).wordCount();

						if ( words > 99 ) {
							report.textstatistics = {
								gradeLevel  : BOLDGRID.SEO.Readability.gradeLevel( content ),
								keywordDensity : BOLDGRID.SEO.Keywords.keywordDensity( content, 'gads' ),
								recommendedKeywords : BOLDGRID.SEO.Keywords.recommendedKeywords( content, 1 ),
							};

							if ( BOLDGRID.SEO.Keywords.getCustomKeyword().length ) {
								customKeyword = { customKeyword : BOLDGRID.SEO.Keywords.getCustomKeyword() };
							} else {
								// Set customKeyword to recommended keyword search.
								customKeyword = { customKeyword : report.textstatistics.recommendedKeywords[0][0] };
							}
							// Assign recommended keyword to text input placeholder.
							$( '#bgseo-custom-keyword' ).attr( 'placeholder', report.textstatistics.recommendedKeywords[0][0] );
							// Extends the report.
							_.extend( report.textstatistics, customKeyword );
						}
					}

					// Listen to changes to the SEO Title.
					if ( eventInfo.titleLength ) {
						report.title.length = eventInfo.titleLength;
					}

					// Listen to changes to the SEO Description.
					if ( eventInfo.descLength ) {
						report.description.length = eventInfo.descLength;
					}

					if ( eventInfo.robotIndex ) {
						report.robotIndex = {
							lengthScore : eventInfo.robotIndex,
						};
					}

					if ( eventInfo.robotFollow ) {
						report.robotFollow = {
							lengthScore : eventInfo.robotFollow,
						};
					}
				}
				console.log(report);
				// Send analysis to display the report.
				$( '#content' ).trigger( 'bgseo-report', [report] );
			});
		},
	};

	self = BOLDGRID.SEO.TinyMCE;

})( jQuery );

BOLDGRID.SEO.TinyMCE.init();

( function ( $ ) {
	'use strict';

	var self;

	BOLDGRID.SEO.ContentAnalysis = {
		// Measured by word count.
		seoContentLengthScore: function( contentLength ) {
			var msg = {};

			if ( contentLength === 0 ) {
				msg = {
					status: 'red',
					msg: _bgseoContentAnalysis.content.length.badEmpty,
				};
			}
			if ( contentLength.isBetween( 0, 199 ) ) {
				msg = {
					status: 'red',
					msg: _bgseoContentAnalysis.content.length.badShort,
				};
			}
			if ( contentLength.isBetween( 198, 300 ) ) {
				msg = {
					status: 'yellow',
					msg: _bgseoContentAnalysis.content.length.ok,
				};
			}
			if ( contentLength > 299 ) {
				msg = {
					status: 'green',
					msg: _bgseoContentAnalysis.content.length.good,
				};
			}

			return msg;
		},
		// Checks if user has any images in their content.
		seoImageLengthScore: function( imageLength ) {
			var msg = {
				status: 'green',
				msg: _bgseoContentAnalysis.image.length.good,
			};
			if ( ! imageLength ) {
				msg = {
					status: 'red',
					msg: _bgseoContentAnalysis.image.length.bad,
				};
			}

			return msg;
		},
	};


	self = BOLDGRID.SEO.ContentAnalysis;

})( jQuery );

( function ( $ ) {

	'use strict';

	var self;

	/**
	 * BoldGrid SEO Description.
	 *
	 * This is responsible for the SEO Description Grading.
	 *
	 * @since 1.3.1
	 */
	BOLDGRID.SEO.Description = {

		/**
		 * Initialize SEO Description Analysis.
		 *
		 * @since 1.3.1
		 */
		init : function () {
			$( document ).ready( function() {
				self._description();
			});
		},

		/**
		 * Sets up event listener for changes made to the SEO Description.
		 *
		 * Listens for changes being made to the SEO Description, and then
		 * triggers the reporter to be updated with new status/score.
		 *
		 * @since 1.3.1
		 */
		_description : function() {
			var desc = $( '#boldgrid-seo-field-meta_description' );
			// Listen for changes to input value.
			desc.on( 'input propertychange paste', _.debounce( function() {
				var descLength = $( this ).val().length;
				$( this ).trigger( 'bgseo-analysis', [{ 'descLength': descLength }] );
			}, 1000 ) );
		},

		/**
		 * Gets score of the SEO Description.
		 *
		 * Checks the length provided and returns a score and status color
		 * for the SEO description.  This score is based on character count.
		 *
		 * @since 1.3.1
		 * @returns {Object} msg Contains status indicator color and message to update.
		 */
		descriptionScore : function( descriptionLength ) {
			var msg = {};

			if ( descriptionLength === 0 ) {
				msg = {
					status: 'red',
					msg: _bgseoContentAnalysis.seoDescription.length.badEmpty,
				};
			}
			if ( descriptionLength.isBetween( 0, 126 ) ) {
				msg = {
					status: 'yellow',
					msg: _bgseoContentAnalysis.seoDescription.length.ok,
				};
			}
			if ( descriptionLength.isBetween( 125, 156 ) ) {
				msg = {
					status: 'green',
					msg: _bgseoContentAnalysis.seoDescriptione.length.good,
				};
			}
			if ( descriptionLength > 156 ) {
				msg = {
					status: 'red',
					msg: _bgseoContentAnalysis.seoDescription.length.badLong,
				};
			}

			return msg;
		},
	};

	self = BOLDGRID.SEO.Description;

})( jQuery );

BOLDGRID.SEO.Description.init();

( function ( $ ) {

	'use strict';

	var self;

	/**
	 * BoldGrid SEO Keywords.
	 *
	 * This is responsible for the SEO Keywords Analysis and Scoring.
	 *
	 * @since 1.3.1
	 */
	BOLDGRID.SEO.Keywords = {

		/**
		 * Gets the count of the keywords in the content passed in.
		 *
		 * @since 1.3.1
		 *
		 * @param {string} content The content to count keyword frequency in.
		 * @param {string} keyword The keyword/phrase to search for.
		 *
		 * @returns {Number} keywordCount Represents how many times a keyword appears.
		 */
		keywordCount: function( content, keyword ) {
			var keywordCount;

			keywordCount = content.split( keyword ).length - 1;

			return keywordCount;
		},

		/**
		 * Calculates keyword density for content and keyword passed in.
		 *
		 * @since 1.3.1
		 *
		 * @param {string} content The content to calculate density for.
		 * @param {string} keyword The keyword to base density measurement on.
		 *
		 * @returns {Number} result Calculated density of keyword in content passed.
		 */
		keywordDensity : function( content, keyword ) {
			var result, keywordCount, wordCount;

			// Normalize.
			keyword = keyword.toLowerCase();

			keywordCount = self.keywordCount( content, keyword );
			wordCount = textstatistics( content ).wordCount();
			// Get the density.
			result = ( ( keywordCount / wordCount ) * 100 );
			// Round it off.
			result = Math.round( result * 10 ) / 10;

			return result;
		},

		/**
		 * Gets the recommended keywords from content.
		 *
		 * This is what gets suggested to a user that their content is about this
		 * keyword if they do not enter in a custom target keyword or phrase.
		 *
		 * @since 1.3.1
		 *
		 * @param {string} text The text to search through.
		 * @param {Number} n How many keywords to return back.
		 *
		 * @returns {Array} result An array of n* most frequent keywords.
		 */
		recommendedKeywords: function( text, n ) {
			// Split text on non word characters
			var words = text.toLowerCase().split( /\W+/ ),
			    positions = {},
			    wordCounts = [],
			    result;

			for ( var i=0; i < words.length; i++ ) {
				var word = words[i];
				if ( ! word || word.length < 3 || _bgseoStopWords.indexOf( word ) > -1 ) {
					continue;
				}

				if ( typeof positions[word] == 'undefined' ) {
					positions[word] = wordCounts.length;
					wordCounts.push( [word, 1] );
				} else {
					wordCounts[positions[word]][1]++;
				}
			}
			// Put most frequent words at the beginning.
			wordCounts.sort( function ( a, b ) {
				return b[1] - a[1];
			});
			// Return the first n items
			result = wordCounts.slice( 0, n );

			return result;
		},
		getCustomKeyword : function() {
			var keyword = $( '#bgseo-custom-keyword' ).val();
			// Trim the input since it's user input to be sure there's no spaces.
			keyword = $.trim( keyword );

			return keyword;
		},

		keywordsInTitle : function() {
			var keyword, title = BOLDGRID.SEO.Title.getTitle();
		},

		keywordsInDescription : function() {

		},
	};

	self = BOLDGRID.SEO.Keywords;

})( jQuery );

( function ( $ ) {

	'use strict';

	var self;

	/**
	 * BoldGrid SEO Readability.
	 *
	 * This is responsible for the SEO Reading Score and Grading.
	 *
	 * @since 1.3.1
	 */
	BOLDGRID.SEO.Readability = {

		/**
		 * Gets the Flesch Kincaid Grade based on the content.
		 *
		 * @since 1.3.1
		 * @returns {Number} result A number representing the grade of the content.
		 */
		gradeLevel : function( content ) {
			var grade, result = {};
			grade = textstatistics( content ).fleschKincaidReadingEase();
			result = self.gradeAnalysis( grade );
			return result;
		},

		/**
		 * Returns information about the grade for display.
		 *
		 * This will give back human readable explanations of the grading, so
		 * the user can make changes based on their score accurately.
		 *
		 * @since 1.3.1
		 * @returns {Object} description Contains status, explanation and associated grade level.
		 */
		gradeAnalysis : function( grade ) {
			var description = {};

			// Grade is higher than 90.
			if ( grade > 90 ) {
				description = {
					'lengthScore' : grade,
					'gradeLevel' : '5th grade',
					'explanation': 'Very easy to read. Easily understood by an average 11-year-old student.',
					'status' : 'green',
					'msg' : _bgseoContentAnalysis.readingEase.goodHigh,
				};
			}
			// Grade is 80-90.
			if ( grade.isBetween( 79, 91 ) ) {
				description = {
					'score'      : grade,
					'gradeLevel' : '6th grade',
					'explanation': 'Easy to read. Conversational English for consumers.',
					'status' : 'green',
					'msg' : _bgseoContentAnalysis.readingEase.goodMedHigh,
				};
			}
			// Grade is 70-90.
			if ( grade.isBetween( 69, 81 ) ) {
				description = {
					'score'      : grade,
					'gradeLevel' : '7th grade',
					'explanation': 'Fairly easy to read.',
					'status' : 'green',
					'msg' : _bgseoContentAnalysis.readingEase.goodMedLow,
				};
			}
			// Grade is 60-70.
			if ( grade.isBetween( 59, 71 ) ) {
				description = {
					'score'      : grade,
					'gradeLevel' : '8th & 9th',
					'explanation': 'Plain English. Easily understood by 13- to 15-year-old students.',
					'status' : 'green',
					'msg' : _bgseoContentAnalysis.readingEase.goodLow,
				};
			}
			// Grade is 50-60.
			if ( grade.isBetween( 49, 61 ) ) {
				description = {
					'score'      : grade,
					'gradeLevel' : '10th to 12th',
					'explanation': 'Fairly difficult to read.',
					'status' : 'yellow',
					'msg' : _bgseoContentAnalysis.readingEase.ok,
				};
			}
			// Grade is 30-50.
			if ( grade.isBetween( 29, 51 ) ) {
				description = {
					'score'      : grade,
					'gradeLevel' : 'College Student',
					'explanation': 'Difficult to read.',
					'status' : 'red',
					'msg' : _bgseoContentAnalysis.readingEase.badHigh,
				};
			}
			// Grade is less than 30.
			if ( grade < 30 ) {
				description = {
					'score'      : grade,
					'gradeLevel' : 'College Graduate',
					'explanation': 'Difficult to read.',
					'status' : 'red',
					'msg' : _bgseoContentAnalysis.readingEase.badLow,
				};
			}
			return description;
		},
	};

	self = BOLDGRID.SEO.Readability;

})( jQuery );

( function ( $ ) {

	'use strict';

	var self;

	/**
	 * BoldGrid SEO Robots.
	 *
	 * This is responsible for the noindex and nofollow checkbox
	 * listeners, and returning status/scores for each.
	 *
	 * @since 1.3.1
	 */
	BOLDGRID.SEO.Robots = {
		/**
		 * Initialize BoldGrid SEO Robots.
		 *
		 * @since 1.3.1
		 */
		init : function () {
			$( document ).ready( function() {
				self._index();
				self._follow();
			});
		},
		/**
		 * Sets up event listener for index/noindex radios.
		 *
		 * Listens for changes being made on the radios, and then
		 * triggers the reporter to be updated with new status/score.
		 *
		 * @since 1.3.1
		 */
		_index : function() {
			var index = $( 'input[name=butterbean_boldgrid_seo_setting_bgseo_robots_index]' );
			// Listen for changes to input value.
			index.on( 'change', function() {
				$( this ).trigger( 'bgseo-analysis', [{ 'robotIndex': self.indexScore() }] );
			});
		},
		/**
		 * Gets score of index/noindex status.
		 *
		 * Checks if index/noindex is checked and returns appropriate
		 * status message and indicator.
		 *
		 * @since 1.3.1
		 * @returns {Object} Contains status indicator color and message to update.
		 */
		indexScore : function() {
			var msg = {
				status: 'green',
				msg: _bgseoContentAnalysis.noIndex.good,
			};

			if ( $( 'input[name=butterbean_boldgrid_seo_setting_bgseo_robots_index][value=noindex]' ).is( ':checked' ) ) {
				msg = {
					status: 'yellow',
					msg: _bgseoContentAnalysis.noIndex.bad,
				};
			}

			return msg;
		},
		/**
		 * Sets up event listener for follow/nofollow radios.
		 *
		 * Listens for changes being made on the radios, and then
		 * triggers the reporter to be updated with new status/score.
		 *
		 * @since 1.3.1
		 */
		_follow : function() {
			var index = $( 'input[name=butterbean_boldgrid_seo_setting_bgseo_robots_follow]' );
			// Listen for changes to input value.
			index.on( 'change', function() {
				$( this ).trigger( 'bgseo-analysis', [{ 'robotFollow': self.followScore() }] );
			});
		},
		/**
		 * Gets score of follow/nofollow status.
		 *
		 * Checks if follow or nofollow is checked, and returns appropriate
		 * status message and indicator.
		 *
		 * @since 1.3.1
		 * @returns {Object} Contains status indicator color and message to update.
		 */
		followScore : function() {
			var msg = {
				status: 'green',
				msg: _bgseoContentAnalysis.noFollow.good,
			};

			if ( $( 'input[name=butterbean_boldgrid_seo_setting_bgseo_robots_follow][value=nofollow]' ).is( ':checked' ) ) {
				msg = {
					status: 'yellow',
					msg: _bgseoContentAnalysis.noFollow.bad,
				};
			}

			return msg;
		},
	};

	self = BOLDGRID.SEO.Robots;

})( jQuery );

BOLDGRID.SEO.Robots.init();

( function ( $ ) {

	'use strict';

	var self;

	/**
	 * BoldGrid SEO Title.
	 *
	 * This is responsible for the SEO Title Grading.
	 *
	 * @since 1.3.1
	 */
	BOLDGRID.SEO.Title = {
		/**
		 * Initialize SEO Title Analysis.
		 *
		 * @since 1.3.1
		 */
		init : function () {
			$( document ).ready( function() {
				self._title();
			});
		},
		getTitle : function() {
			var title = $( '#boldgrid-seo-field-meta_title' );
			return title;
		},
		/**
		 * Sets up event listener for changes made to the SEO Title.
		 *
		 * Listens for changes being made to the SEO Title, and then
		 * triggers the reporter to be updated with new status/score.
		 *
		 * @since 1.3.1
		 */
		_title: function() {
			var title = self.getTitle();
			// Listen for changes to input value.
			title.on( 'input propertychange paste', _.debounce( function() {
				var titleLength = $( this ).val().length;
				$( this ).trigger( 'bgseo-analysis', [{'titleLength': titleLength}] );
			}, 1000 ) );
		},
		/**
		 * Gets score of the SEO Title.
		 *
		 * Checks the length provided and returns a score for the SEO
		 * title.  This score is based on character count.
		 *
		 * @since 1.3.1
		 * @returns {Object} msg Contains status indicator color and message to update.
		 */
		titleScore: function( titleLength ) {
			var msg = {};
			// No title entered.
			if ( titleLength === 0 ) {
				msg = {
					status: 'red',
					msg: _bgseoContentAnalysis.seoTitle.length.badEmpty,
				};
			}
			// Title is 0-30 characters.
			if ( titleLength.isBetween( 0, 31 ) ) {
				msg = {
					status: 'yellow',
					msg: _bgseoContentAnalysis.seoTitle.length.ok,
				};
			}
			// Title is 30-70 characters.
			if ( titleLength.isBetween( 29, 71 ) ) {
				msg = {
					status: 'green',
					msg: _bgseoContentAnalysis.seoTitle.length.good,
				};
			}
			// Title is grater than 70 characters.
			if ( titleLength > 70 ) {
				msg = {
					status: 'red',
					msg: _bgseoContentAnalysis.seoTitle.length.badLong,
				};
			}

			return msg;
		},
	};

	self = BOLDGRID.SEO.Title;

})( jQuery );

BOLDGRID.SEO.Title.init();

( function ( $ ) {

	'use strict';

	var self;

	BOLDGRID.SEO.Util = {
		/**
		 * Initialize Word Count.
		 *
		 * @since 1.2.1
		 */
		init : function () {
			// Adds a function for bool response if number is within a range.
			Number.prototype.isBetween = function( min, max ) {
				return this > min && this < max;
			};
		},
	};

	self = BOLDGRID.SEO.Util;

})( jQuery );

BOLDGRID.SEO.Util.init();

( function( $, counter ) {
	$( function() {
		var $content = $( '#content' ),
			$count = $( '#wp-word-count' ).find( '.word-count' ),
			prevCount = 0,
			contentEditor;

		function update() {
			var text, count;

			if ( ! contentEditor || contentEditor.isHidden() ) {
				text = $content.val();
			} else {
				text = contentEditor.getContent( { format: 'raw' } );
			}

			count = counter.count( text );

			if ( count !== prevCount ) {
				$content.trigger( 'bgseo-analysis', [{'count': count}]);
			}

			prevCount = count;
		}

		$( document ).on( 'tinymce-editor-init', function( event, editor ) {
			if ( editor.id !== 'content' ) {
				return;
			}

			contentEditor = editor;

			editor.on( 'nodechange keyup', _.debounce( update, 1000 ) );
		} );

		$content.on( 'input keyup', _.debounce( update, 1000 ) );

		update();
	} );
} )( jQuery, new wp.utils.WordCounter() );