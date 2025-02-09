"use client"

import { motion } from "framer-motion"

// // Monedas caen desde arriba del cerdo hasta la ranura
// const COIN_POSITIONS = [
//   { startX: -30 },
//   { startX: -30 },
//   { startX: -30 },
// ]

export function AnimatedPig() {
  return (
    <div className="relative w-[450px] h-[200px] flex items-center justify-center -mt-20 overflow-visible">
      {/* Moneda única (punto de la i) cayendo */}
      <motion.div
        className="absolute z-20 left-[60%] top-[-300px]" // Posicionado en el punto de la i
        initial={{
          opacity: 1,
          scale: 1,
        }}
        animate={{
          y: [250, 300], // Cae desde el punto de la i hasta la ranura
          x: [15, -15], // Ligero movimiento diagonal
          scale: [1, 1, 0.8], // Efecto de perspectiva al caer
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 1,
          ease: "easeIn",
          times: [0, 0.8, 1], // Controla la aceleración de la caída
        }}
      >
        <div className="w-4 h-4 rounded-full bg-[#C71CD2] shadow-[0_0_15px_#C71CD2] opacity-90" />
      </motion.div>

      {/* Cerdito Neón */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="500"
          height="500"
          viewBox="-10.59 0.59 1080 1080"
          className="-translate-x-20"
        >
          <g transform="matrix(1 0 0 1 540 305.33)">
            {/* Cuerpo principal */}
            <g transform="matrix(0.14 0 0 -0.14 -3.67 199.73)">
              <path 
                style={{
                  fill: "#C71CD2",
                  fillOpacity: "0.94",
                  stroke: "none"
                }}
                d="M1030 1836C904 1801 654 1694 630 1665C621 1655 624 1642 640 1609C665 1561 674 1580 565 1451C527 1406 492 1351 469 1298C433 1216 432 1215 390 1208C335 1198 302 1177 293 1142C288 1127 285 1061 285 995C285 883 287 872 314 820C329 790 354 752 369 736C409 692 486 660 551 660C601 660 609 657 641 624C687 576 782 508 853 474C921 440 924 429 880 330C845 251 844 240 868 211C885 190 890 190 1129 192L1374 195L1407 238C1424 261 1449 307 1460 339L1482 398L1698 403C1910 408 2019 423 2113 459C2139 469 2140 468 2140 439C2140 421 2124 373 2105 330C2064 239 2064 236 2090 210C2109 191 2123 190 2353 190C2626 191 2614 188 2663 272C2694 323 2720 430 2720 505C2720 533 2713 594 2704 643L2688 730L2723 803C2773 905 2790 980 2790 1104C2790 1190 2793 1210 2805 1210C2813 1210 2835 1224 2854 1241C2917 1295 2912 1384 2843 1461C2803 1505 2774 1514 2784 1478C2800 1427 2802 1370 2790 1355C2766 1326 2745 1340 2705 1413C2645 1521 2519 1642 2405 1702C2291 1761 2184 1796 2045 1820C1755 1868 1445 1848 1199 1765C1159 1751 1126 1740 1124 1740C1123 1740 1119 1765 1115 1795C1108 1856 1106 1857 1030 1836z"
              />
            </g>

            {/* Ranura (ajustada posición y color negro) */}
            <g transform="matrix(0.14 0 0 -0.14 0 180)">
              <path 
                style={{
                  fill: "#000000",
                  fillOpacity: "1",
                  stroke: "none"
                }}
                d="M1499 1561C1394 1541 1340 1528 1336 1521C1333 1517 1337 1494 1344 1469C1359 1420 1359 1420 1448 1439C1666 1484 2022 1447 2207 1361L2270 1331L2301 1376C2318 1401 2328 1425 2324 1430C2302 1449 2100 1523 2017 1541C1915 1563 1583 1576 1499 1561z"
              />
            </g>

            {/* Ojo (ajustado posición y color negro) */}
            <g transform="matrix(0.14 0 0 -0.13 -24 170)">
              <path 
                style={{
                  fill: "#000000",
                  fillOpacity: "1",
                  stroke: "none"
                }}
                d="M857 1320C794 1270 805 1174 876 1144C948 1114 1020 1162 1020 1242C1020 1324 922 1371 857 1320z"
              />
            </g>
          </g>
        </svg>
      </motion.div>
    </div>
  )
} 