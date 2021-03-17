/**
 * External dependencies
 */
import { assign, isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Notice,
	Slot,
	Flex,
	FlexItem,
	FlexBlock,
	Button,
	Popover,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { createInterpolateElement, useState } from '@wordpress/element';
import { moreHorizontalMobile, check } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import UserRole from './user-role';
import DateTime from './date-time';
import ScreenSize from './screen-size';

/**
 * Render a control set
 *
 * @since 1.6.0
 * @param {Object} props All the props passed to this function
 * @return {string}		 Return the rendered JSX
 */
export default function ControlSet( props ) {
	const [ popoverOpen, setPopoverOpen ] = useState( false );
	const {
		setAttributes,
		settings,
		variables,
		enabledControls,
		blockAtts,
		controlSetAtts,
	} = props;

	const controls = [
		{
			slug: 'dateTime',
			name: 'Date & Time',
			active: controlSetAtts?.controls.hasOwnProperty( 'dateTime' ),
			enable: enabledControls.includes( 'date_time' ),
		},
		{
			slug: 'userRole',
			name: 'User Roles',
			active: controlSetAtts?.controls.hasOwnProperty( 'userRole' ),
			enable: enabledControls.includes( 'visibility_by_role' ),
		},
		{
			slug: 'screenSize',
			name: 'Screen Size',
			active: controlSetAtts?.controls.hasOwnProperty( 'screenSize' ),
			enable: enabledControls.includes( 'screen_size' ),
		},
	];

	function toggleControls( control ) {
		if ( control.active ) {
			delete controlSetAtts.controls[ control.slug ];
		} else if ( ! controlSetAtts.controls[ control.slug ] ) {
			controlSetAtts.controls[ control.slug ] = {};
		}

		blockAtts.controlSets[ controlSetAtts.id ] = controlSetAtts;

		setAttributes( {
			blockVisibility: assign(
				{ ...blockAtts },
				{ controlSets: blockAtts.controlSets }
			),
		} );
	}

	function setControlAtts( control, values ) {
		controlSetAtts.controls[ control ] = values;

		blockAtts.controlSets[ controlSetAtts.id ] = controlSetAtts;

		setAttributes( {
			blockVisibility: assign(
				{ ...blockAtts },
				{ controlSets: blockAtts.controlSets }
			),
		} );
	}

	return (
		<div className="block-visibility__control-set">
			<Flex className="block-visibility__control-set-header">
				<FlexBlock>
					<h3>{ __( 'Controls', 'block-visibility' ) }</h3>
				</FlexBlock>
				<FlexItem>
					<Button
						label={ __(
							'Configure Visibility Controls',
							'block-visibility'
						) }
						icon={ moreHorizontalMobile }
						className="control-ellipsis"
						onClick={ () => setPopoverOpen( ( open ) => ! open ) }
					/>
					{ popoverOpen && (
						<Popover
							className="block-visibility__control-popover"
							focusOnMount="container"
							onClose={ () => setPopoverOpen( false ) }
						>
							<MenuGroup label="Enabled Controls">
								{ controls.map( ( control ) => {
									if ( ! control.enable ) {
										return null;
									}

									return (
										<MenuItem
											key={ control.slug }
											icon={ control.active ? check : '' }
											onClick={ () =>
												toggleControls( control )
											}
										>
											{ control.name }
										</MenuItem>
									);
								} ) }
							</MenuGroup>
						</Popover>
					) }
				</FlexItem>
			</Flex>
			<DateTime
				settings={ settings }
				variables={ variables }
				enabledControls={ enabledControls }
				setControlAtts={ setControlAtts }
				controlSetAtts={ controlSetAtts }
				{ ...props }
			/>
			<UserRole
				settings={ settings }
				variables={ variables }
				enabledControls={ enabledControls }
				setControlAtts={ setControlAtts }
				controlSetAtts={ controlSetAtts }
				{ ...props }
			/>
			<ScreenSize
				settings={ settings }
				enabledControls={ enabledControls }
				setControlAtts={ setControlAtts }
				controlSetAtts={ controlSetAtts }
				{ ...props }
			/>
			{ /* TODO fix this!!! */ }
			{ isEmpty( controlSetAtts.controls ) && (
				<Notice status="notice" isDismissible={ false }>
					{ createInterpolateElement(
						__(
							'Add some controls… <a>plugin settings</a>.',
							'block-visibility'
						),
						{
							a: (
								<a // eslint-disable-line
									href="example.com"
									target="_blank"
									rel="noreferrer"
								/>
							),
						}
					) }
					<span className="visibility-control__help">
						{ __(
							'Notice only visible to Administrators.',
							'block-visibility'
						) }
					</span>
				</Notice>
			) }
		</div>
	);
}
