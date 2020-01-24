import { Feature } from "geojson"

export interface JAppState {
  panel: JAppPanelState
  measure: JAppMeasureState
  selection: JAppSelectionState
  mapContext: JAppMapContextState
  ui: JAppUiState
  print: JAppPrintState
}

export interface JAppPanelState {
  active: JAppPanel,
  all: JAppPanel[]
}

export interface JAppUiState {
  sidePanelVisible: boolean
  theme: { [Key: string]: string | boolean | number }
  container: {
    width: number
    height: number
  }
}

export interface JAppMapContextState {
  contexts: JMapContext[]
  selectedContextId?: string
  defaultContext?: JMapContext
}

export interface JAppMeasureState {
  measureType: JAppMeasureType,
  isNewElement: boolean,
  isDeletingMeasure: boolean,
  totalLength: number,
  totalArea: number
}

export interface JAppPrintState {
  currentTab: JPrintTabName
  paperFormat: JPaperFormat
  fileType: JPrintFileType
  isOrientationPortrait: boolean
  marginRatio: number
  imagePPI: number
  base64Image: string
  pageTitle: string
  pageSubTitle: string
  isDateVisible: boolean
  isNorthArrowVisible: boolean
  isScaleVisible: boolean
  scale: number
  isLegend: boolean
  legendTitle: string
  legendSubTitle: string
  legendPosition: JPrintLegendPosition
  filterList: any[]
}

export interface JAppSelectionState {
  selectionType: JAppSelectionType,
  isNewElement: boolean,
  tableLayerId?: number
}

export interface JApplicationMainService {
  getVersion(): string
  openDocumentation(): void
}

export interface JApplicationUIService {
  Container: {
    getId(): string
    getWidth(): number
    getHeight(): number
  },
  SidePanel: {
    isVisible(): boolean
    setVisible(isVisible: boolean): void
  }
}

export interface JApplicationService extends JApplicationMainService {
  Panel: JAppPanelService
  Measure: JAppMeasureService
  Selection: JAppSelectionService
  Print: JAppPrintService
  UI: JApplicationUIService
}

export interface JPaperFormat {
  type: string,
  width: number
  height: number
  ratio: number
}

export interface JMapContext {
  id?: number,
  title: string,
  description: string,
  shared: boolean,
  origin: "web-ng",
  uuid: string,
  author?: string
  creationDate?: string
  modificationDate?: string
  projectId?: string
  data: {
    mapCenter: { x: number, y: number }
    mapZoom: number
    mapPitch: number
    mapBearing: number
    baseMap: string
    selection: {[ layerId: number ]: any[]}
    measure: JExternalMeasureItem[]
    thumbnail: string
  }
}

export interface JExternalMeasureItem {
  point: Feature
  line: Feature
  fill?: Feature
  popups: Array<{ coordinates: [number, number], html: string }>
  id: number
  type: JAppMeasureType
}

export interface JAppSelectionService {
  changeCurrentSelectionType(newSelectionType: JAppSelectionType): void
  cancelSelection(): void
  getCurrentDrawnSelectionContent(): JMapSelection
  removeLastDrawnSelectionCoordinate(): void
}

export interface JAppMeasureService {
  changeCurrentMeasureType(newMeasureType: JAppMeasureType): void
  activateDeleting(): void
  deleteAllMeasures(): void
  cancelCurrentMeasure(): void
  deleteMeasureAtLocation(location: JLocation): void
  finalizeMeasure(): void
}

export interface JAppPanelService {
  getActive(): JAppPanel
  getAll(): JAppPanel[]
  activate(panelId: string): void
}

export interface JHideablePanel {
  setVisible(open: boolean): void
  isVisible(): boolean
  toggleVisibility(): void
  open(): void
  close(): void
}

export interface JAppPrintService {
  toggleTab(): void
  setCurrentTab(tabName: JPrintTabName): void
  getCurrentTab(): JPrintTabName
  getAllTabNames(): JPrintTabName[]
  refreshScaleForCurrentZoom(): void
  setScaleControlVisibility(isVisible: boolean): void
  isScaleControlVisible(): boolean
  setPageTitle(title: string): void
  getPageTitle(): string
  setPageSubTitle(subTitle: string): void
  getPageSubTitle(): string
  setDateVisibility(isVisible: boolean): void
  isDateVisibile(): boolean
  setNorthArrowVisibility(isVisible: boolean): void
  isNorthArrowVisible(): boolean
  getAllPaperFormats(): JPaperFormat[]
  setPaperFormat(format: JPaperFormat): void
  getPaperFormat(): JPaperFormat
  setImagePPI(imagePPI: number): void
  getImagePPI(): number
  setOrientation(isPortrait: boolean): void
  isOrientationPortrait(): boolean
  setFileType(fileType: JPrintFileType): void
  getFileType(): JPrintFileType
  setMarginRatio(marginRatio: number): void
  getMarginRatio(): number
  getScale(): number
  setZoomFromScale(scale: number): void
  takeCapture(): void
}
