import Button from "@/components/button/BaseButton"
import { ModalButton } from "@/components/button/ModalButton"
import Input from "@/components/input/Input"
import { TextInputBlock } from "@/components/input/TextInput"
import VehicleSelector from "@/components/input/VehicleSelector"
import { useDataEditContext } from "@/context/DataEditContext"
import { useDialog } from "@/context/DialogContext"
import { useModalContext } from "@/context/ModalContext"
import { useTheme } from "@/context/ThemeContext"
import useGetTravelData from "@/hooks/useGetTravelData"
import { useLoading } from "@/hooks/useLoading"
import useModalHandler from "@/hooks/useModalHandler"
import { inputElementStyles } from "@/src/styles/InputStyles"
import { EditableRoute } from "@/src/types/EditableTravels"
import { ModalProp } from "@/src/types/TravelModal"
import { VehicleType } from "@/src/types/Travels"
import { sortByIdToFront } from "@/src/utils/utils"
import { useFocusEffect } from "expo-router"
import { useCallback, useRef, useState } from "react"
import { ScrollView, View } from "react-native"
import EditTravelStopModal from "../travelModal/EditTravelStopModal"


export default function EditRouteModal({ stops: stops, onCancel, onSubmit }: ModalProp) {
    const { dialog } = useDialog()
    const { theme } = useTheme()
    const { setVehicleTypeId } = useModalContext()

    const { modalData: data } = useDataEditContext()

    const { fullVehicleTypes } = useGetTravelData()

    const {
        showModal,
        editingField,
        searchQuery,
        setSearchQuery,
        openModalWithSearch,
        closeModal
    } = useModalHandler()

    const [route, setRoute] = useState<EditableRoute>({
        ...data,
        'first_stop_id': data.first_stop_id.id,
        'last_stop_id': data.last_stop_id.id,
        'vehicle_type_id': data.vehicle_type.id
    })

    const savedVehicleTypeId = useRef(route.vehicle_type.id)

    const { loading } = useLoading()

    useFocusEffect(
        useCallback(() => {
            setVehicleTypeId(null)
        }, [])
    )

    const handleStopSelect = (stopId: number) => {
        if (!editingField) {
            return
        }

        setRoute({ ...route, [editingField]: stopId })
        closeModal()
    }

    const handleOnSubmit = () => {
        if (!route.name || !route.first_stop_id || !route.last_stop_id || !route.vehicle_type) {
            dialog('Input Required', 'Please add name/stops/vehicle type')
            return
        }

        const { vehicle_type, ...cleanRoute } = route

        onSubmit(cleanRoute)
    }

    return (
        <View>
            {loading || !stops ? (
                <Input.LoadingLabel />
            ) : (
                <>
                    <Input.Container>
                        <TextInputBlock
                            label="Code"
                            value={route.code}
                            placeholder="Route code..."
                            onChangeText={(text) => setRoute({ ...route, "code": text })}
                            onClear={() => setRoute({ ...route, "code": '' })}
                        />

                        <TextInputBlock
                            label="Name"
                            value={route.name}
                            placeholder="Route name..."
                            onChangeText={(text) => setRoute({ ...route, "name": text })}
                            onClear={() => setRoute({ ...route, "name": '' })}
                            required
                        />

                        <ModalButton.Block
                            label="Default First Stop"
                            condition={route.first_stop_id}
                            value={stops.find(item => item.id === route.first_stop_id)?.name || 'Select First Stop'}
                            onPress={() => openModalWithSearch('first_stop_id')}
                            required
                        />

                        <ModalButton.Block
                            label="Default Last Stop"
                            condition={route.last_stop_id}
                            value={stops.find(item => item.id === route.last_stop_id)?.name || 'Select Last Stop'}
                            onPress={() => openModalWithSearch('last_stop_id')}
                            required
                        />

                        <View style={inputElementStyles[theme].inputGroup}>
                            <View style={{
                                flexDirection: 'column',
                            }}>
                                <Input.Label required={!route.vehicle_type_id}>Type</Input.Label>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyboardShouldPersistTaps={"always"}
                                >
                                    {sortByIdToFront(fullVehicleTypes, savedVehicleTypeId.current).map((type: VehicleType) => (
                                        <VehicleSelector
                                            key={type.id}
                                            type={type}
                                            condition={route.vehicle_type_id === type.id}
                                            onPress={() => setRoute({ ...route, vehicle_type_id: type.id })}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Input.Container>

                    <EditTravelStopModal
                        stops={stops}
                        isModalVisible={showModal}
                        searchQuery={searchQuery}
                        vehicleTypeId={route.vehicle_type_id}
                        setSearchQuery={setSearchQuery}
                        onSelect={handleStopSelect}
                        onClose={closeModal}
                    />

                    <Button.Row>
                        <Button.Dismiss label='Cancel' onPress={onCancel} />
                        <Button.Add label='Edit Route' onPress={handleOnSubmit} />
                    </Button.Row>
                </>
            )}
        </View>
    )
}