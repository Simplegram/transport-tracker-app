import Button from "@/components/button/BaseButton"
import { ModalButton } from "@/components/button/ModalButton"
import TypeButton from "@/components/button/TypeButton"
import Container from "@/components/Container"
import Divider from "@/components/Divider"
import Input from "@/components/input/Input"
import EditTravelDirectionModal from "@/components/modal/travelModal/EditTravelDirectionModal"
import EditTravelRouteModal from "@/components/modal/travelModal/EditTravelRouteModal"
import EditTravelStopModal from "@/components/modal/travelModal/EditTravelStopModal"
import { JustifiedLabelValue } from "@/components/travel/IndividualTravelDetailCard"
import { useTheme } from "@/context/ThemeContext"
import useGetTravelData from "@/hooks/useGetTravelData"
import useModalHandler from "@/hooks/useModalHandler"
import useTravelDetail from "@/hooks/useTravelDetail"
import { inputElementStyles } from "@/src/styles/InputStyles"
import { travelDetailStyles } from "@/src/styles/TravelDetailStyles"
import { addTime, getTimeString, timeToMinutes } from "@/src/utils/dateUtils"
import { useFocusEffect } from "expo-router"
import React, { useEffect, useState } from "react"
import { Text, View } from "react-native"

interface TravelTimeInput {
    route_id: number | undefined
    direction_id: number | undefined
    first_stop_id: number | undefined
    last_stop_id: number | undefined
    estimate_type: 'best' | 'average' | 'worst'
}

const typeIndex = {
    best: 'min_top_5_shortest',
    average: 'avg_travel_time',
    worst: 'max_top_5_longest'
}

export default function EstimationPage() {
    const { theme } = useTheme()

    const { stops, routes, directions } = useGetTravelData()

    const { averageTime, getTravelTime } = useTravelDetail()

    const {
        showModal: showRouteModal,
        searchQuery: routeSearchQuery,
        setSearchQuery: setRouteSearchQuery,
        openModalWithSearch: openRouteModal,
        closeModal: closeRouteModal
    } = useModalHandler()

    const {
        showModal: showDirectionModal,
        searchQuery: directionSearchQuery,
        setSearchQuery: setDirectionSearchQuery,
        openModalWithSearch: openDirectionModal,
        closeModal: closeDirectionModal
    } = useModalHandler()

    const {
        showModal: showStopModal,
        editingField: stopEditingField,
        searchQuery: stopSearchQuery,
        setSearchQuery: setStopSearchQuery,
        openModalWithSearch: openStopModal,
        closeModal: closeStopModal
    } = useModalHandler()

    const [travelTimes, setTravelTimes] = useState<string>()
    const [input, setInput] = useState<TravelTimeInput>({
        route_id: undefined,
        direction_id: undefined,
        first_stop_id: undefined,
        last_stop_id: undefined,
        estimate_type: 'average'
    })

    const [currentTime, setCurrentTime] = useState<string>(getTimeString())
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)

    useEffect(() => {
        setInterval(() => {
            setCurrentTime(getTimeString())
        }, 1000)
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            if (averageTime) {
                const estimatedTime = timeToMinutes(averageTime[typeIndex[input.estimate_type]])
                setTravelTimes(estimatedTime)
            }
        }, [averageTime])
    )

    const handleRouteSelect = (routeId: number) => {
        setInput({ ...input, route_id: routeId })
        closeRouteModal()
    }

    const handleDirectionSelect = (directionId: number) => {
        setInput({ ...input, direction_id: directionId })
        closeDirectionModal()
    }

    const handleStopSelect = (stopId: number) => {
        if (stopEditingField) {
            setInput({ ...input, [stopEditingField]: stopId })
        }
        closeStopModal()
    }

    const handleOnSubmit = async () => {
        setSelectedTime(currentTime)
        if (input.route_id && input.direction_id && input.first_stop_id && input.last_stop_id) {
            await getTravelTime(input.route_id, input.direction_id, input.first_stop_id, input.last_stop_id)
        }
    }

    const setTimeCase = (time: any) => {
        setInput({ ...input, estimate_type: time })
    }

    const route = routes.find(item => item.id === input.route_id)
    const tripIdentifier = route ? `${route && route.code} | ${route && route.name}` : 'East to West'

    const first_stop = stops.find(stop => stop.id === input.first_stop_id)
    const last_stop = stops.find(stop => stop.id === input.last_stop_id)
    const stopString = `${first_stop ? first_stop.name : 'Start'} to ${last_stop ? last_stop.name : 'End'}`

    return (
        <Container>
            <View style={{ flex: 1, gap: 10 }}>
                <Container.DetailRow>
                    <JustifiedLabelValue label="Current Time:" value={currentTime} />
                </Container.DetailRow>
                <Container.DetailRow>
                    <Text style={travelDetailStyles[theme].specialValue}>{tripIdentifier}</Text>
                    <Input.ValueText>{stopString}</Input.ValueText>
                    <Divider />
                    <JustifiedLabelValue label="Route Average:" value={((travelTimes === 'Invalid date') || typeof travelTimes === 'undefined') ? '-' : travelTimes} />
                    <Divider />
                    <View style={{
                        alignItems: 'center',
                        paddingVertical: 5,
                    }}>
                        <JustifiedLabelValue label="Start at:" value={travelTimes ? `${selectedTime}` : '-'} />
                        <JustifiedLabelValue label="Arrive at:" value={travelTimes ? `${addTime(travelTimes, selectedTime)}` : '-'} />
                    </View>
                </Container.DetailRow>
            </View>
            <Input.Container style={{ paddingBottom: 0 }}>
                <View style={inputElementStyles[theme].inputLargeGroup}>
                    <ModalButton.Block
                        label='Route'
                        condition={input.route_id}
                        value={input.route_id ? `${routes.find(route => route.id === input.route_id)?.code || ''} | ${routes.find(route => route.id === input.route_id)?.name || ''}` : 'Select Route...'}
                        onPress={() => openRouteModal()}
                        required
                    />

                    <ModalButton.Block
                        label='Direction'
                        condition={input.direction_id}
                        value={directions.find(direction => direction.id === input.direction_id)?.name || 'Select Direction...'}
                        onPress={() => openDirectionModal()}
                        required
                    />

                    <ModalButton.Block
                        label='First Stop'
                        condition={input.first_stop_id}
                        value={stops.find(stop => stop.id === input.first_stop_id)?.name || 'Select First Stop...'}
                        onPress={() => openStopModal('first_stop_id')}
                        required
                    />

                    <ModalButton.Block
                        label='Last Stop'
                        condition={input.last_stop_id}
                        value={stops.find(stop => stop.id === input.last_stop_id)?.name || 'Select Last Stop...'}
                        onPress={() => openStopModal('last_stop_id')}
                        required
                    />

                    <Input>
                        <Input.Label>Estimate Type</Input.Label>
                        <TypeButton.Block
                            type={input.estimate_type}
                            onPress={setTimeCase}
                        />
                    </Input>
                </View>
            </Input.Container>

            <Button.Row>
                <Button.Add label='Get Estimate' onPress={handleOnSubmit} />
            </Button.Row>

            <EditTravelDirectionModal
                directions={directions}
                isModalVisible={showDirectionModal}
                searchQuery={directionSearchQuery}
                setSearchQuery={setDirectionSearchQuery}
                onSelect={handleDirectionSelect}
                onClose={closeDirectionModal}
            />

            <EditTravelRouteModal
                routes={routes}
                isModalVisible={showRouteModal}
                searchQuery={routeSearchQuery}
                setSearchQuery={setRouteSearchQuery}
                onSelect={handleRouteSelect}
                onClose={closeRouteModal}
            />

            <EditTravelStopModal
                stops={stops}
                isModalVisible={showStopModal}
                searchQuery={stopSearchQuery}
                vehicleTypeId={route?.vehicle_type.id}
                setSearchQuery={setStopSearchQuery}
                onSelect={handleStopSelect}
                onClose={closeStopModal}
            />
        </Container>
    )
}