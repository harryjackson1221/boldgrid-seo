<?php

/**
 * BoldGrid Source Code
 *
 * @package Boldgrid_Seo_Config
 * @copyright BoldGrid.com
 * @version $Id$
 * @author BoldGrid.com <wpb@boldgrod.com>
 */

/**
 * Boldgrid Upgrade Class
 *
 * Responsible for performing any upgrade methods that
 * are version specific needs.
 *
 * @since 1.3.1
 */
class Boldgrid_Seo_Upgrade {

	/**
	 * BoldGrid SEO Configs array.
	 *
	 * @var array
	 *
	 * @access protected
	 *
	 * @since 1.3.1
	 */
	protected $configs;

	/**
	 * Prefix string used in plugin.
	 *
	 * @var string
	 *
	 * @access protected
	 *
	 * @since 1.3.1
	 */
	protected $prefix;

	/**
	 * Constructor.
	 *
	 * @access public
	 *
	 * @since 1.3.1
	 */
	public function __construct( $configs ) {
		$this->configs = $configs;
		$this->prefix = str_replace( '-', '_', $this->configs['plugin_name'] );
	}

	/**
	 * Checks the DB for current version number, and compares to version set by configs.
	 *
	 * If there's a method upgrade_to_MAJOR_MINOR_SUBMINOR() then that method
	 * will be executed if the method's specified version is less than/equal to the
	 * current version in configs, and greater than the stored version in the DB.
	 *
	 * Since we didn't need any upgrade methods initially, we will set the default
	 * version in the DB to 1.0.0 and run any upgrade methods required from then
	 * on.  All additional upgrade methods in the future should be added here in
	 * the same format to be automatically managed and handled.
	 *
	 * @access public
	 *
	 * @since 1.3.1
	 */
	public function upgrade_db_check() {
		 $this->set_option( '1.0.0' );
		// Set the default version in db if no version is set.
		if ( ! $this->get_option() ) $this->set_option( '1.0.0' );
		// Get current version from configs.
		$version = $this->configs['version'];
		// If the db version doesn't match the config version then run upgrade methods.
		if ( $this->get_option() !== $version ) {
			$methods = $this->get_upgrade_methods();
			// Format found methods to versions.
			foreach( $methods as $method ) {
				$ver = substr( $method, 11 );
				$ver = str_replace( '_', '.', $ver );
				// Gives precedence to minor version specific upgrades over subminors.
				$verHigh = str_replace( 'x', '9999', $ver );
				$verLow = str_replace( 'x', '0', $ver );
				// If upgrade method version is greater than stored DB version.
				if ( version_compare( $verHigh, $this->get_option(), 'gt' )  &&
					// The config version is less than or equal to upgrade method versions.
					version_compare( $verLow, $version, 'le' ) ) {
						if ( is_callable( array( $this, $method ) ) ) $this->$method();
				}
			}

			// Once done with method calls, update the version number.
			$this->set_option( $this->configs['version'] );
		}
	}

	/**
	 * Gets an array of upgrade methods.
	 *
	 * This checks __CLASS__ to see what methods are available
	 * as class
	 *
	 * @access public
	 *
	 * @since 1.3.1
	 *
	 * @return array $methods List of available upgrade methods.
	 */
	public function get_upgrade_methods() {
		$methods = get_class_methods( $this );
		$methods = array_filter( $methods, function( $key ) {
			return strpos( $key, 'upgrade_to_' ) !== false;
		});

		return $methods;
	}

	/**
	 * Get option.
	 *
	 * This checks if option has been set in db.
	 *
	 * @access public
	 *
	 * @since 1.3.1
	 *
	 * @return mixed Version as a string or false.
	 */
	public function get_option() {
		return get_site_option( "{$this->prefix}_version" );
	}

	/**
	 * Set option for version.
	 *
	 * This sets the version option in the db.
	 *
	 * @access public
	 *
	 * @since 1.3.1
	 */
	public function set_option( $version ) {
		update_site_option( "{$this->prefix}_version", $version );
	}

	/**
	 * Upgrade to version 1.3.x
	 *
	 * This will perform upgrade tasks for 1.3 as a minor version as a whole. This
	 * updates old postmeta meta_key naming to fit in with the new naming
	 * convention used in the plugin.
	 *
	 * @link https://codex.wordpress.org/Class_Reference/wpdb#UPDATE_rows
	 *
	 * @access public
	 *
	 * @since 1.3.1
	 */
	public function upgrade_to_1_3_x() {
		global $wpdb;
		$wpdb->update(
			$wpdb->postmeta,
			array(
				'meta_key' => 'bgseo_description',
				'meta_key' => 'bgseo_title',
			),
			array(
				'meta_key' => 'meta_description',
				'meta_key' => 'meta_title',
			)
		);
	}
}
