/**
 * External dependencies
 */
import { assign } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	Disabled,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Notice,
	Slot,
	TextControl,
	withFilters,
} from '@wordpress/components';
import { pencil, moreVertical } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import CalendarPopover from './calendar-popover';
import DateTimeField from './date-time-field';
import formatDateLabel from './format-date-label';

// Provides an entry point to slot in additional settings. Must be placed
// outside of function to avoid unnecessary rerenders.
const AdditionalScheduleControls = withFilters(
	'blockVisibility.addDateTimeScheduleControls'
)( ( props ) => <></> ); // eslint-disable-line

/**
 * Add the block Schedule component.
 *
 * @since 1.8.0
 * @param {Object} props All the props passed to this function
 * @return {string}		 Return the rendered JSX
 */
export default function Schedule( props ) {
	const {
		type,
		dateTime,
		schedules,
		scheduleIndex,
		scheduleAtts,
		controlSetAtts,
		setControlAtts,
		hideOnSchedules,
	} = props;
	const [ pickerOpen, setPickerOpen ] = useState( false );
	const [ pickerType, setPickerType ] = useState( null );

	// There needs to be a unique index for the Slots since we technically have
	// multiple of the same Slot.
	const uniqueIndex =
		type === 'single'
			? type + '-' + scheduleIndex
			: type + '-' + controlSetAtts?.id + '-' + scheduleIndex;

	const title = scheduleAtts?.title ?? '';
	const enable = scheduleAtts?.enable ?? true;
	const start = scheduleAtts?.start ?? null;
	const end = scheduleAtts?.end ?? null;

	const today = new Date( new Date().setHours( 0, 0, 0, 0 ) );

	const scheduleTitle = title ? title : __( 'Schedule', 'block-visibility' );
	const startDateLabel = formatDateLabel(
		start,
		__( 'Now', 'block-visibility' )
	);
	const endDateLabel = formatDateLabel(
		end,
		__( 'Forever', 'block-visibility' )
	);

	// If there is no start date/time selected, but there is an end, default the
	// starting selection in the calendar to the day prior.
	const selectedStart = ( _start, _end, _today ) => {
		if ( _start ) {
			return _start;
		}

		const startAlt = _end ? new Date( _end ) : new Date( _today );

		if ( _end ) {
			startAlt.setHours( 0, 0, 0, 0 );
			startAlt.setDate( startAlt.getDate() - 1 );
		}

		return startAlt;
	};

	// If there is no end date/time selected, but there is a start, default the
	// starting selection in the calendar to the next day.
	const selectedEnd = ( _start, _end, _today ) => {
		if ( _end ) {
			return _end;
		}

		const endAlt = _start ? new Date( _start ) : new Date( _today );
		endAlt.setHours( 0, 0, 0, 0 );
		endAlt.setDate( endAlt.getDate() + 1 );

		return endAlt;
	};

	// If the start time is greater or equal to the end time, display a warning.
	let alert = false;
	if ( start && end ) {
		alert = start >= end ? true : false;
	}

	function duplicateSchedule() {
		const newSchedules = [ ...schedules, scheduleAtts ];

		setControlAtts(
			'dateTime',
			assign( { ...dateTime }, { schedules: [ ...newSchedules ] } )
		);
	}

	function removeSchedule() {
		const newSchedules = schedules.filter(
			( value, index ) => index !== scheduleIndex
		);

		setControlAtts(
			'dateTime',
			assign( { ...dateTime }, { schedules: [ ...newSchedules ] } )
		);
	}

	const setAttribute = ( attribute, value ) => {
		const newScheduleAtts = { ...scheduleAtts };
		const newSchedules = [ ...schedules ];

		newScheduleAtts[ attribute ] = value;
		newSchedules[ scheduleIndex ] = newScheduleAtts;

		setControlAtts(
			'dateTime',
			assign( { ...dateTime }, { schedules: [ ...newSchedules ] } )
		);
	};

	const editTitleDropdown = (
		<DropdownMenu
			label={ __( 'Edit', 'block-visibility' ) }
			icon={ pencil }
			popoverProps={ {
				className: 'block-visibility__control-popover edit-title',
				focusOnMount: 'container',
			} }
			toggleProps={ { isSmall: true } }
		>
			{ () => (
				<TextControl
					value={ title }
					label={ __( 'Schedule title', 'block-visibility' ) }
					placeholder={ __( 'Schedule', 'block-visibility' ) }
					onChange={ ( value ) => setAttribute( 'title', value ) }
				/>
			) }
		</DropdownMenu>
	);

	const removeLabel =
		schedules.length <= 1
			? __( 'Clear schedule', 'block-visibility' )
			: __( 'Remove schedule', 'block-visibility' );

	const optionsDropdown = (
		<DropdownMenu
			className="options-dropdown"
			label={ __( 'Options', 'block-visibility' ) }
			icon={ moreVertical }
			popoverProps={ { focusOnMount: 'container' } }
		>
			{ ( { onClose } ) => (
				<>
					<Slot name="ScheduleOptionsTop" />

					<MenuGroup label={ __( 'Tools', 'block-visibility' ) }>
						<Slot name="ScheduleOptionsTools" />
						<MenuItem
							onClick={ () => setAttribute( 'enable', ! enable ) }
						>
							{ enable
								? __( 'Disable', 'block-visibility' )
								: __( 'Enable', 'block-visibility' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								duplicateSchedule();
								onClose();
							} }
						>
							{ __( 'Duplicate', 'block-visibility' ) }
						</MenuItem>
					</MenuGroup>

					<Slot name="ScheduleOptionsMiddle" />

					<MenuGroup>
						<MenuItem
							onClick={ () => {
								removeSchedule();
								onClose();
							} }
						>
							{ removeLabel }
						</MenuItem>
					</MenuGroup>

					<Slot name="ScheduleOptionsBottom" />
				</>
			) }
		</DropdownMenu>
	);

	let dateTimeControls = (
		<div className="schedules-item__fields">
			<Slot name={ 'DateTimeScheduleControlsTop-' + uniqueIndex } />

			<div className="schedules-item__fields__date-time">
				<div className="control-fields-item__label">
					{ sprintf(
						// Translators: Whether the block is hidden or visible.
						__( '%s the block', 'block-visibility' ),
						hideOnSchedules
							? __( 'Hide', 'block-visibility' )
							: __( 'Show', 'block-visibility' )
					) }
				</div>
				<div className="date-time-items">
					<div className="date-time-item">
						<span className="control-fields-item__sub-label">
							{ __( 'From', 'block-visibility' ) }
						</span>
						<DateTimeField
							label={ startDateLabel }
							title={ __(
								'Choose a start date/time',
								'block-visibility'
							) }
							dateType="start"
							hasDateTime={ start }
							setAttribute={ setAttribute }
							setPickerType={ setPickerType }
							setPickerOpen={ setPickerOpen }
						/>
					</div>
					<div className="date-time-item">
						<span className="control-fields-item__sub-label">
							{ __( 'To', 'block-visibility' ) }
						</span>
						<DateTimeField
							label={ endDateLabel }
							title={ __(
								'Choose a end date/time',
								'block-visibility'
							) }
							dateType="end"
							hasDateTime={ end }
							setAttribute={ setAttribute }
							setPickerType={ setPickerType }
							setPickerOpen={ setPickerOpen }
						/>
					</div>
					{ pickerOpen && pickerType && (
						<CalendarPopover
							currentDate={
								pickerType === 'start'
									? selectedStart( start, end, today )
									: selectedEnd( start, end, today )
							}
							label={
								pickerType === 'start'
									? __( 'Start Date/Time', 'block-visibility' )
									: __( 'End Date/Time', 'block-visibility' )
							}
							isOpen={ setPickerOpen }
							setAttribute={ setAttribute }
							setPickerOpen={ setPickerOpen }
							pickerType={ pickerType }
						/>
					) }
				</div>
				{ alert && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'The start time is after the stop time. Please fix for date/time settings to function properly.',
							'block-visibility'
						) }
					</Notice>
				) }
			</div>

			<Slot name={ 'DateTimeScheduleControlsBottom-' + uniqueIndex } />
		</div>
	);

	if ( ! enable ) {
		dateTimeControls = <Disabled>{ dateTimeControls }</Disabled>;
	}

	return (
		<div
			className={ classnames( 'schedules-item', {
				disabled: ! enable,
			} ) }
		>
			<div className="section-header">
				<div className="section-header__title">
					<span>{ scheduleTitle }</span>
					{ editTitleDropdown }
				</div>
				<div className="section-header__toolbar">
					<Slot name={ 'DateTimeScheduleToolbar-' + uniqueIndex } />

					{ optionsDropdown }
				</div>
			</div>

			{ dateTimeControls }

			<AdditionalScheduleControls
				uniqueIndex={ uniqueIndex }
				{ ...props }
			/>
		</div>
	);
}
