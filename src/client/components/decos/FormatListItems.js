/* eslint-disable */
import React from 'react';

export default function FormatListItems(list, numOfItemsInOneDivision) {
  const formattedOutput = [];
  let iconCommonStyle = {width:'25px', height:'25px', marginRight: '5px'};

  function getItemIcon(itemName) {
    switch(itemName) {
      case 'living room':
      case 'Furnished':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="couch" class="svg-inline--fa fa-couch fa-w-10" role="img" viewBox="0 0 640 512">
                <path fill="currentColor" d="M160 224v64h320v-64c0-35.3 28.7-64 64-64h32c0-53-43-96-96-96H160c-53 0-96 43-96 96h32c35.3 0 64 28.7 64 64zm416-32h-32c-17.7 0-32 14.3-32 32v96H128v-96c0-17.7-14.3-32-32-32H64c-35.3 0-64 28.7-64 64 0 23.6 13 44 32 55.1V432c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16v-16h384v16c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16V311.1c19-11.1 32-31.5 32-55.1 0-35.3-28.7-64-64-64z"/>
              </svg>
      case 'Kitchen':
      case 'kitchen':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" 
                >
                <path d="M26 1a5 5 0 0 1 5 5c0 6.389-1.592 13.187-4 14.693V31h-2V20.694c-2.364-1.478-3.942-8.062-3.998-14.349L21 6l.005-.217A5 5 0 0 1 26 1zm-9 0v18.118c2.317.557 4 3.01 4 5.882 0 3.27-2.183 6-5 6s-5-2.73-5-6c0-2.872 1.683-5.326 4-5.882V1zM2 1h1c4.47 0 6.934 6.365 6.999 18.505L10 21H3.999L4 31H2zm14 20c-1.602 0-3 1.748-3 4s1.398 4 3 4 3-1.748 3-4-1.398-4-3-4zM4 3.239V19h3.995l-.017-.964-.027-.949C7.673 9.157 6.235 4.623 4.224 3.364l-.12-.07zm19.005 2.585L23 6l.002.31c.045 4.321 1.031 9.133 1.999 11.39V3.17a3.002 3.002 0 0 0-1.996 2.654zm3.996-2.653v14.526C27.99 15.387 29 10.4 29 6a3.001 3.001 0 0 0-2-2.829z">
                </path>
              </svg>
      case 'Parking':
      case 'parking':
          return <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" 
                style={{width:'25px', height:'25px', marginRight: '5px'}}>
                <path d="M16 1c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C1 7.716 7.716 1 16 1zm0 2C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm2 5a5 5 0 0 1 .217 9.995L18 18h-5v6h-2V8zm0 2h-5v6h5a3 3 0 0 0 .176-5.995z">
                </path>
              </svg>
      case 'Internet':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="wifi" class="svg-inline--fa fa-wifi fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M634.91 154.88C457.74-8.99 182.19-8.93 5.09 154.88c-6.66 6.16-6.79 16.59-.35 22.98l34.24 33.97c6.14 6.1 16.02 6.23 22.4.38 145.92-133.68 371.3-133.71 517.25 0 6.38 5.85 16.26 5.71 22.4-.38l34.24-33.97c6.43-6.39 6.3-16.82-.36-22.98zM320 352c-35.35 0-64 28.65-64 64s28.65 64 64 64 64-28.65 64-64-28.65-64-64-64zm202.67-83.59c-115.26-101.93-290.21-101.82-405.34 0-6.9 6.1-7.12 16.69-.57 23.15l34.44 33.99c6 5.92 15.66 6.32 22.05.8 83.95-72.57 209.74-72.41 293.49 0 6.39 5.52 16.05 5.13 22.05-.8l34.44-33.99c6.56-6.46 6.33-17.06-.56-23.15z"/></svg>
      case 'Private Bathroom':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="toilet" class="svg-inline--fa fa-toilet fa-w-12" role="img" viewBox="0 0 384 512"><path fill="currentColor" d="M368 48c8.8 0 16-7.2 16-16V16c0-8.8-7.2-16-16-16H16C7.2 0 0 7.2 0 16v16c0 8.8 7.2 16 16 16h16v156.7C11.8 214.8 0 226.9 0 240c0 67.2 34.6 126.2 86.8 160.5l-21.4 70.2C59.1 491.2 74.5 512 96 512h192c21.5 0 36.9-20.8 30.6-41.3l-21.4-70.2C349.4 366.2 384 307.2 384 240c0-13.1-11.8-25.2-32-35.3V48h16zM80 72c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H88c-4.4 0-8-3.6-8-8V72zm112 200c-77.1 0-139.6-14.3-139.6-32s62.5-32 139.6-32 139.6 14.3 139.6 32-62.5 32-139.6 32z"/>
               </svg>
      case 'Private entrance':
      case 'Separate Entrance':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="door-open" class="svg-inline--fa fa-door-open fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M624 448h-80V113.45C544 86.19 522.47 64 496 64H384v64h96v384h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM312.24 1.01l-192 49.74C105.99 54.44 96 67.7 96 82.92V448H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h336V33.18c0-21.58-19.56-37.41-39.76-32.17zM264 288c-13.25 0-24-14.33-24-32s10.75-32 24-32 24 14.33 24 32-10.75 32-24 32z"/>
               </svg>
      case 'Pet Allowed':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cat" class="svg-inline--fa fa-cat fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z"/>
               </svg>
      case 'Easy Access to Public Transport':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bus-alt" class="svg-inline--fa fa-bus-alt fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M488 128h-8V80c0-44.8-99.2-80-224-80S32 35.2 32 80v48h-8c-13.25 0-24 10.74-24 24v80c0 13.25 10.75 24 24 24h8v160c0 17.67 14.33 32 32 32v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h192v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h6.4c16 0 25.6-12.8 25.6-25.6V256h8c13.25 0 24-10.75 24-24v-80c0-13.26-10.75-24-24-24zM160 72c0-4.42 3.58-8 8-8h176c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H168c-4.42 0-8-3.58-8-8V72zm-48 328c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm128-112H128c-17.67 0-32-14.33-32-32v-96c0-17.67 14.33-32 32-32h112v160zm32 0V128h112c17.67 0 32 14.33 32 32v96c0 17.67-14.33 32-32 32H272zm128 112c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"/>
               </svg>
      case 'Smoke Friendly':
        return <svg style={{width:'25px', height:'25px', marginRight: '5px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="smoking" class="svg-inline--fa fa-smoking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M632 352h-48c-4.4 0-8 3.6-8 8v144c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8zM553.3 87.1c-5.7-3.8-9.3-10-9.3-16.8V8c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v62.3c0 22 10.2 43.4 28.6 55.4 42.2 27.3 67.4 73.8 67.4 124V280c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-30.3c0-65.5-32.4-126.2-86.7-162.6zM432 352H48c-26.5 0-48 21.5-48 48v64c0 26.5 21.5 48 48 48h384c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16zm-32 112H224v-64h176v64zm87.7-322.4C463.8 125 448 99.3 448 70.3V8c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v66.4c0 43.7 24.6 81.6 60.3 106.7 22.4 15.7 35.7 41.2 35.7 68.6V280c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-30.3c0-43.3-21-83.4-56.3-108.1zM536 352h-48c-4.4 0-8 3.6-8 8v144c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8z"/>
               </svg>
      case 'TV entertainment system':
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tv" class="svg-inline--fa fa-tv fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm-16 352H64V64h512z"/>
               </svg>
      case 'Fire extinguisher':
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="fire-extinguisher" class="svg-inline--fa fa-fire-extinguisher fa-w-14" role="img" viewBox="0 0 448 512"><path fill="currentColor" d="M434.027 26.329l-168 28C254.693 56.218 256 67.8 256 72h-58.332C208.353 36.108 181.446 0 144 0c-39.435 0-66.368 39.676-52.228 76.203-52.039 13.051-75.381 54.213-90.049 90.884-4.923 12.307 1.063 26.274 13.37 31.197 12.317 4.926 26.279-1.075 31.196-13.37C75.058 112.99 106.964 120 168 120v27.076c-41.543 10.862-72 49.235-72 94.129V488c0 13.255 10.745 24 24 24h144c13.255 0 24-10.745 24-24V240c0-44.731-30.596-82.312-72-92.97V120h40c0 2.974-1.703 15.716 10.027 17.671l168 28C441.342 166.89 448 161.25 448 153.834V38.166c0-7.416-6.658-13.056-13.973-11.837zM144 72c-8.822 0-16-7.178-16-16s7.178-16 16-16 16 7.178 16 16-7.178 16-16 16z"/>
               </svg> 
      case 'Air Conditioner':
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="fan" class="svg-inline--fa fa-fan fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M352.57 128c-28.09 0-54.09 4.52-77.06 12.86l12.41-123.11C289 7.31 279.81-1.18 269.33.13 189.63 10.13 128 77.64 128 159.43c0 28.09 4.52 54.09 12.86 77.06L17.75 224.08C7.31 223-1.18 232.19.13 242.67c10 79.7 77.51 141.33 159.3 141.33 28.09 0 54.09-4.52 77.06-12.86l-12.41 123.11c-1.05 10.43 8.11 18.93 18.59 17.62 79.7-10 141.33-77.51 141.33-159.3 0-28.09-4.52-54.09-12.86-77.06l123.11 12.41c10.44 1.05 18.93-8.11 17.62-18.59-10-79.7-77.51-141.33-159.3-141.33zM256 288a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"/>
               </svg>
      case 'pool':
        return  <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="swimmer" class="svg-inline--fa fa-swimmer fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M189.61 310.58c3.54 3.26 15.27 9.42 34.39 9.42s30.86-6.16 34.39-9.42c16.02-14.77 34.5-22.58 53.46-22.58h16.3c18.96 0 37.45 7.81 53.46 22.58 3.54 3.26 15.27 9.42 34.39 9.42s30.86-6.16 34.39-9.42c14.86-13.71 31.88-21.12 49.39-22.16l-112.84-80.6 18-12.86c3.64-2.58 8.28-3.52 12.62-2.61l100.35 21.53c25.91 5.53 51.44-10.97 57-36.88 5.55-25.92-10.95-51.44-36.88-57L437.68 98.47c-30.73-6.58-63.02.12-88.56 18.38l-80.02 57.17c-10.38 7.39-19.36 16.44-26.72 26.94L173.75 299c5.47 3.23 10.82 6.93 15.86 11.58zM624 352h-16c-26.04 0-45.8-8.42-56.09-17.9-8.9-8.21-19.66-14.1-31.77-14.1h-16.3c-12.11 0-22.87 5.89-31.77 14.1C461.8 343.58 442.04 352 416 352s-45.8-8.42-56.09-17.9c-8.9-8.21-19.66-14.1-31.77-14.1h-16.3c-12.11 0-22.87 5.89-31.77 14.1C269.8 343.58 250.04 352 224 352s-45.8-8.42-56.09-17.9c-8.9-8.21-19.66-14.1-31.77-14.1h-16.3c-12.11 0-22.87 5.89-31.77 14.1C77.8 343.58 58.04 352 32 352H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h16c38.62 0 72.72-12.19 96-31.84 23.28 19.66 57.38 31.84 96 31.84s72.72-12.19 96-31.84c23.28 19.66 57.38 31.84 96 31.84s72.72-12.19 96-31.84c23.28 19.66 57.38 31.84 96 31.84h16c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm-512-96c44.18 0 80-35.82 80-80s-35.82-80-80-80-80 35.82-80 80 35.82 80 80 80z"/>
        </svg>
      case 'gym':
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="dumbbell" class="svg-inline--fa fa-dumbbell fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M104 96H56c-13.3 0-24 10.7-24 24v104H8c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h24v104c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24zm528 128h-24V120c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v272c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h24c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM456 32h-48c-13.3 0-24 10.7-24 24v168H256V56c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v400c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h128v168c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24z"/>
               </svg>
      case 'Heater':
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="fire" class="svg-inline--fa fa-fire fa-w-12" role="img" viewBox="0 0 384 512"><path fill="currentColor" d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"/>
               </svg>
      case 'Closet':
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tshirt" class="svg-inline--fa fa-tshirt fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M631.2 96.5L436.5 0C416.4 27.8 371.9 47.2 320 47.2S223.6 27.8 203.5 0L8.8 96.5c-7.9 4-11.1 13.6-7.2 21.5l57.2 114.5c4 7.9 13.6 11.1 21.5 7.2l56.6-27.7c10.6-5.2 23 2.5 23 14.4V480c0 17.7 14.3 32 32 32h256c17.7 0 32-14.3 32-32V226.3c0-11.8 12.4-19.6 23-14.4l56.6 27.7c7.9 4 17.5.8 21.5-7.2L638.3 118c4-7.9.8-17.6-7.1-21.5z"/>
               </svg>
      case "Desk":
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="book-reader" class="svg-inline--fa fa-book-reader fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M352 96c0-53.02-42.98-96-96-96s-96 42.98-96 96 42.98 96 96 96 96-42.98 96-96zM233.59 241.1c-59.33-36.32-155.43-46.3-203.79-49.05C13.55 191.13 0 203.51 0 219.14v222.8c0 14.33 11.59 26.28 26.49 27.05 43.66 2.29 131.99 10.68 193.04 41.43 9.37 4.72 20.48-1.71 20.48-11.87V252.56c-.01-4.67-2.32-8.95-6.42-11.46zm248.61-49.05c-48.35 2.74-144.46 12.73-203.78 49.05-4.1 2.51-6.41 6.96-6.41 11.63v245.79c0 10.19 11.14 16.63 20.54 11.9 61.04-30.72 149.32-39.11 192.97-41.4 14.9-.78 26.49-12.73 26.49-27.06V219.14c-.01-15.63-13.56-28.01-29.81-27.09z"/>
               </svg>
      case "Smoke detector":
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="smog" class="svg-inline--fa fa-smog fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M624 368H80c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h544c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16zm-480 96H16c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h128c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16zm416 0H224c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h336c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16zM144 288h156.1c22.5 19.7 51.6 32 83.9 32s61.3-12.3 83.9-32H528c61.9 0 112-50.1 112-112S589.9 64 528 64c-18 0-34.7 4.6-49.7 12.1C454 31 406.8 0 352 0c-41 0-77.8 17.3-104 44.8C221.8 17.3 185 0 144 0 64.5 0 0 64.5 0 144s64.5 144 144 144z"/>
               </svg>
      case "laundry": 
        return <svg style={iconCommonStyle} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="hand-sparkles" class="svg-inline--fa fa-hand-sparkles fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M106.66,170.64l.09,0,49.55-20.65a7.32,7.32,0,0,0,3.68-6h0a7.29,7.29,0,0,0-3.68-6l-49.57-20.67-.07,0L86,67.68a6.66,6.66,0,0,0-11.92,0l-20.7,49.63-.05,0L3.7,138A7.29,7.29,0,0,0,0,144H0a7.32,7.32,0,0,0,3.68,6L53.27,170.6l.07,0L74,220.26a6.65,6.65,0,0,0,11.92,0l20.69-49.62ZM471.38,467.41l-1-.42-1-.5a38.67,38.67,0,0,1,0-69.14l1-.49,1-.43,37.49-15.63,15.63-37.48.41-1,.47-.95c3.85-7.74,10.58-13.63,18.35-17.34,0-1.33.25-2.69.27-4V144a32,32,0,0,0-64,0v72a8,8,0,0,1-8,8H456a8,8,0,0,1-8-8V64a32,32,0,0,0-64,0V216a8,8,0,0,1-8,8H360a8,8,0,0,1-8-8V32a32,32,0,0,0-64,0V216a8,8,0,0,1-8,8H264a8,8,0,0,1-8-8V64a32,32,0,0,0-64,0v241l-23.59-32.49a40,40,0,0,0-64.71,47.09L229.3,492.21A48.07,48.07,0,0,0,268.09,512H465.7c19.24,0,35.65-11.73,43.24-28.79l-.07-.17ZM349.79,339.52,320,351.93l-12.42,29.78a4,4,0,0,1-7.15,0L288,351.93l-29.79-12.41a4,4,0,0,1,0-7.16L288,319.94l12.42-29.78a4,4,0,0,1,7.15,0L320,319.94l29.79,12.42a4,4,0,0,1,0,7.16ZM640,431.91a7.28,7.28,0,0,0-3.68-6l-49.57-20.67-.07,0L566,355.63a6.66,6.66,0,0,0-11.92,0l-20.7,49.63-.05,0L483.7,426a7.28,7.28,0,0,0-3.68,6h0a7.29,7.29,0,0,0,3.68,5.95l49.57,20.67.07,0L554,508.21a6.65,6.65,0,0,0,11.92,0l20.69-49.62h0l.09,0,49.55-20.66a7.29,7.29,0,0,0,3.68-5.95h0Z"/>
               </svg>
      default: 
        return ""
    }
  }

  function formatSingleDivision(list, index, length) {
    const items = [];
    let count = 0;

    for (let curIndex = index; curIndex < length && count < numOfItemsInOneDivision; curIndex++, count++) {
      items.push(<li key={list[curIndex]}>
                  <section style={{display: 'flex', marginBottom: '10px'}}>
                    {getItemIcon(list[curIndex])}
                    <section className="_lsFont2" style={{marginTop: '4px'}}> {list[curIndex]} </section>
                  </section>
                </li>);
    }

    return (
      <div className="col-4" style={{ paddingTop: '8px'}} key={index}>
        <ul style={{ listStyleType: 'none' }}>
          {items}
        </ul>
      </div>
    );
  }

  for (let index = 0; index < list.length; index += numOfItemsInOneDivision) {
    formattedOutput.push(formatSingleDivision(list, index, list.length, numOfItemsInOneDivision));
  }

  return formattedOutput;
}
