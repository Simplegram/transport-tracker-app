import Button from "@/components/button/BaseButton"
import Input from "@/components/input/Input"
import { TextInputBase } from "@/components/input/TextInput"
import ModalTemplate from "@/components/ModalTemplate"
import { useModalContext } from "@/context/ModalContext"
import { useTheme } from "@/context/ThemeContext"
import { modalElementStyles, modalStyles } from "@/src/styles/ModalStyles"
import { EditableTravelStopModalProp } from "@/src/types/EditableTravels"
import { Stop } from "@/src/types/Travels"
import { useEffect, useMemo, useState } from "react"
import { Pressable, View } from "react-native"
import FlatlistBase from "../FlatlistPicker"

export default function EditTravelStopModal({ stops, searchQuery, isModalVisible, vehicleTypeId, setSearchQuery, onClose, onSelect }: EditableTravelStopModalProp) {
    const { theme } = useTheme()

    const [enableFilter, setEnableFilter] = useState<boolean>(false)

    useEffect(() => {
        if (vehicleTypeId) setEnableFilter(true)
    }, [vehicleTypeId])

    const filteredStops = useMemo(() => {
        if (!stops) return []
        const query = searchQuery.toLowerCase()
        const stopsByQuery = stops.filter(stop =>
            stop.name.toLowerCase().includes(query)
        )
        const stopsByVehicleId = stopsByQuery.filter(stop => stop.vehicle_type?.id === vehicleTypeId)
        return (enableFilter && vehicleTypeId) ? stopsByVehicleId : stopsByQuery
    }, [stops, searchQuery, enableFilter, vehicleTypeId])

    return (
        <ModalTemplate.Bottom
            visible={isModalVisible}
            onRequestClose={onClose}
        >
            <ModalTemplate.BottomContainer>
                <View style={modalElementStyles[theme].header}>
                    <Input.Header>Select a stop</Input.Header>
                    <Pressable onPress={onClose}>
                        <Input.Subtitle>Close</Input.Subtitle>
                    </Pressable>
                </View>
                <View style={{
                    gap: 5,
                    flexDirection: 'row'
                }}>
                    <TextInputBase.Clear
                        value={searchQuery}
                        placeholder="Search stop..."
                        onChangeText={setSearchQuery}
                        onClear={() => setSearchQuery('')}
                        containerStyle={{ flex: 6.5 }}
                    />
                    <Button.Switch switch={enableFilter} onPress={() => setEnableFilter(!enableFilter)}>Filter</Button.Switch>
                </View>
                {filteredStops.length === 0 ? (
                    <View style={modalStyles[theme].emptyList}>
                        <Input.Label>No stop found</Input.Label>
                    </View>
                ) : (
                    <FlatlistBase.Picker
                        items={filteredStops}
                        onSelect={onSelect}
                    >
                        {(item: Stop) => (
                            <FlatlistBase.PickerItem item={item}>
                                <Input.SubtitlePrimary>{item.name}</Input.SubtitlePrimary>
                            </FlatlistBase.PickerItem>
                        )}
                    </FlatlistBase.Picker>
                )}
            </ModalTemplate.BottomContainer>
        </ModalTemplate.Bottom>
    )
}