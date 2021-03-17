/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import hasDateTime from './has-date-time';
import hasUserRoles from './has-user-roles';
import hasScreenSize from './has-screen-size';
import hasVisibilityControls from './../utils/has-visibility-controls';
import usePluginData from './../utils/use-plugin-data';
import {
	isPluginSettingEnabled,
	getEnabledControls,
} from './../utils/setting-utilities';

/**
 * Filter each block and add CSS classes based on visibility settings.
 *
 * @since 1.1.0
 * @param {Object} BlockListBlock
 */
function withContextualIndicators( BlockListBlock ) {
	return ( props ) => {
		const settings = usePluginData( 'settings' );

		if ( settings === 'fetching' ) {
			return <BlockListBlock { ...props } />;
		}

		const { name, attributes } = props;
		const enableIndicators = isPluginSettingEnabled(
			settings,
			'enable_contextual_indicators'
		);
		const hasVisibility = hasVisibilityControls( settings, name );
		const enabledControls = getEnabledControls( settings );

		if (
			! enableIndicators ||
			! hasVisibility ||
			enabledControls.length === 0
		) {
			return <BlockListBlock { ...props } />;
		}

		const { blockVisibility } = attributes;
		const hideBlock = blockVisibility?.hideBlock ?? false;
		const isHidden = hideBlock && enabledControls.includes( 'hide_block' );

		const hasControlSets = blockVisibility?.controlSets ?? false;
		let testAtts = blockVisibility ?? {};

		if ( hasControlSets ) {
			// The control set array is empty or the default set has no applied controls.
			if ( blockVisibility.controlSets.length !== 0 && blockVisibility.controlSets[ 0 ]?.controls ) {
				testAtts = blockVisibility.controlSets[ 0 ].controls;
			} else {
				testAtts = {};
			}
		}

		// Some blocks have rendering issues when we set the icons to the
		// :before pseudo class. For those blocks, use a background image
		// instead.
		const backgroundBlocks = [ 'core/pullquote' ];

		let classes = classnames( {
			'block-visibility__is-hidden': isHidden,
			'block-visibility__has-roles': hasUserRoles(
				testAtts,
				hasControlSets,
				enabledControls
			),
			'block-visibility__has-date-time': hasDateTime(
				testAtts,
				hasControlSets,
				enabledControls
			),
			'block-visibility__has-screen-size': hasScreenSize(
				testAtts,
				hasControlSets,
				enabledControls,
				settings
			),
			'block-visibility__set-icon-background': backgroundBlocks.includes(
				name
			),
		} );

		if ( classes ) {
			classes = classes + ' block-visibility__has-visibility';
		}

		return <BlockListBlock { ...props } className={ classes } />;
	};
}

addFilter(
	'editor.BlockListBlock',
	'block-visibility/visibility-contextual-indicators',
	withContextualIndicators
);
