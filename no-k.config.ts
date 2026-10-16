export default {
  "schemaVersion": 1,
  "directories": {
    "core": "packages/lib/hermes/src",
    "lib": "packages/lib/hermes/src"
  },
  "installed": [
    {
      "name": "algorithm-geometry-ccw",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-geometry-ccw",
            "packageName": "@hermes/algorithm-geometry-ccw",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/geometry/ccw/ccw.ts": "ba3acc225a9ff79b22cec728500cbdc07fb7a67b4a7f6a5e735db1557c5e6461",
              "algorithm/geometry/ccw/index.ts": "50c3b0e0c5904455ec5ab46e7de542835b389acaf7dbdfb2a345076444fef1b9"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-geometry-convex-hull",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-geometry-ccw",
            "packageName": "@hermes/algorithm-geometry-ccw",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/geometry/ccw/ccw.ts": "ba3acc225a9ff79b22cec728500cbdc07fb7a67b4a7f6a5e735db1557c5e6461",
              "algorithm/geometry/ccw/index.ts": "50c3b0e0c5904455ec5ab46e7de542835b389acaf7dbdfb2a345076444fef1b9"
            },
            "requires": []
          },
          {
            "name": "algorithm-geometry-convex-hull",
            "packageName": "@hermes/algorithm-geometry-convex-hull",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/geometry/convex-hull/convex-hull.ts": "4f74d51257ae88a9b8406f032b847c51cb5239e5337aaa97818436a5fca65a0b",
              "algorithm/geometry/convex-hull/index.ts": "66e6930ed8d9d243030e45c5e70fd1a15b9ae0e45fdce6bee4687b740afaf9e5"
            },
            "requires": [
              {
                "packageName": "@hermes/algorithm-geometry-ccw",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "algorithm-geometry-polygon-area",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-geometry-ccw",
            "packageName": "@hermes/algorithm-geometry-ccw",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/geometry/ccw/ccw.ts": "ba3acc225a9ff79b22cec728500cbdc07fb7a67b4a7f6a5e735db1557c5e6461",
              "algorithm/geometry/ccw/index.ts": "50c3b0e0c5904455ec5ab46e7de542835b389acaf7dbdfb2a345076444fef1b9"
            },
            "requires": []
          },
          {
            "name": "algorithm-geometry-polygon-area",
            "packageName": "@hermes/algorithm-geometry-polygon-area",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/geometry/polygon-area/index.ts": "70f13dc50ff1fbd90939923378928c98a0514edeb3782ccec1e3889c6bfad825",
              "algorithm/geometry/polygon-area/polygon-area.ts": "68e79d3a87298482d536e5018ce3d4351147ddc312b85f8551b196117cd1cc29"
            },
            "requires": [
              {
                "packageName": "@hermes/algorithm-geometry-ccw",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-bellman-ford",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-bellman-ford",
            "packageName": "@hermes/algorithm-graph-bellman-ford",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/bellman-ford/bellman-ford.ts": "f35b591cf9fc6c4a5beb6d141a3381ae2521e9767e908a6d0d99157cf0054b41",
              "algorithm/graph/bellman-ford/index.ts": "1e5d6e8e636333de6f4755e79789a7a15066c9160e8dbfae3770c28b8034e41d"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-bfs",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-bfs",
            "packageName": "@hermes/algorithm-graph-bfs",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/bfs/bfs.ts": "a7a4b5db5c82914b4f3c18edc74628771299d0289e4f5548032a780ba01cc1da",
              "algorithm/graph/bfs/index.ts": "4d19f9d1a1ff2af9cec0f54dc69c08e9fd2249ff86d2ad923ad20d325f7a4af4"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-dfs",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-dfs",
            "packageName": "@hermes/algorithm-graph-dfs",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/dfs/dfs.ts": "1bfaa8798375c0101119f7f1f71db4b4ab2e93317df627cb799292b285b32c79",
              "algorithm/graph/dfs/index.ts": "6a642193680d7fab7cebfb1713cfb7fa6f1223cb2038e4176954e4922a8af161"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-dijkstra",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-dijkstra",
            "packageName": "@hermes/algorithm-graph-dijkstra",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/dijkstra/dijkstra.ts": "97af39f93a4ba414d182c0f5a13d0ceca64da7debe342f04abd2fce069222b7f",
              "algorithm/graph/dijkstra/index.ts": "d2b30722f39e1e9141c27f8e500de7e4cbccfee41a9d271744c3c33a1118deae"
            },
            "requires": [
              {
                "packageName": "@hermes/data-structure-priority-queue",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          },
          {
            "name": "data-structure-heap",
            "packageName": "@hermes/data-structure-heap",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/heap/heap.ts": "68fc95274e5a2234fc3992cd1cba59e523050d55ae3a842bfbac30943b24f6f6",
              "data-structure/heap/index.ts": "d84ec9b2413aa9020e3c6ab99b9589328ae543c89257b099bddefacd4640865b",
              "data-structure/heap/max-heap.ts": "e11fff5efd124e2d636f0f42c475ae593091a416a11dad840c67ed2fa55a986c",
              "data-structure/heap/min-heap.ts": "e4271b7630458178c4dd8b76f6fce5fa8f00f86370043f6adf1ae51828f1efb8"
            },
            "requires": []
          },
          {
            "name": "data-structure-priority-queue",
            "packageName": "@hermes/data-structure-priority-queue",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/priority-queue/index.ts": "70ea451cc731c2201a617be3e8a00f30b4c6c34d40cddf1d6cb65371082365e9",
              "data-structure/priority-queue/priority-queue.ts": "0ce8a7bd626cb435af32b02d960d8fb56689ad7600bea549ba4170f98c8dea42"
            },
            "requires": [
              {
                "packageName": "@hermes/data-structure-heap",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-floyd-warshall",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-floyd-warshall",
            "packageName": "@hermes/algorithm-graph-floyd-warshall",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/floyd-warshall/floyd-warshall.ts": "04e5db49785ce74b840b0b9f38699400dada9a7303f0d2ead5c85ff2d639c536",
              "algorithm/graph/floyd-warshall/index.ts": "ca8d90e5838889eaca80868d3eee2b36ae5b75e3c07f27b6976bb990ef4b68fb"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-kruskal",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-kruskal",
            "packageName": "@hermes/algorithm-graph-kruskal",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/kruskal/index.ts": "81c382e837dc954fb539e565878e8fb64cf4dc4331624a9e8281c2ca1134bb36",
              "algorithm/graph/kruskal/kruskal.ts": "6265fdbefad25bde2e146a143db99fe84da47e073bcc919ac0920ce3f2187ee8"
            },
            "requires": [
              {
                "packageName": "@hermes/data-structure-union-find",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          },
          {
            "name": "data-structure-union-find",
            "packageName": "@hermes/data-structure-union-find",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/union-find/index.ts": "024399647096d798a1263b9e2e8ca16c512e69f55d0799831445236f9186d8fa",
              "data-structure/union-find/union-find.ts": "9a23ce526b297a8b7d477c06d0f10be9000014208a61d44955edfe2671064f21"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-prim",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-dijkstra",
            "packageName": "@hermes/algorithm-graph-dijkstra",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/dijkstra/dijkstra.ts": "97af39f93a4ba414d182c0f5a13d0ceca64da7debe342f04abd2fce069222b7f",
              "algorithm/graph/dijkstra/index.ts": "d2b30722f39e1e9141c27f8e500de7e4cbccfee41a9d271744c3c33a1118deae"
            },
            "requires": [
              {
                "packageName": "@hermes/data-structure-priority-queue",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          },
          {
            "name": "algorithm-graph-prim",
            "packageName": "@hermes/algorithm-graph-prim",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/prim/index.ts": "48bcb6e04d1e9aa94559af28298081e232f576d06b920435646066be6355568c",
              "algorithm/graph/prim/prim.ts": "1c4753dd7e21dc7b75dba95abac8e239de3ebb6bf7f878ab7d12cc80a9703499"
            },
            "requires": [
              {
                "packageName": "@hermes/algorithm-graph-dijkstra",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "@hermes/data-structure-priority-queue",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          },
          {
            "name": "data-structure-heap",
            "packageName": "@hermes/data-structure-heap",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/heap/heap.ts": "68fc95274e5a2234fc3992cd1cba59e523050d55ae3a842bfbac30943b24f6f6",
              "data-structure/heap/index.ts": "d84ec9b2413aa9020e3c6ab99b9589328ae543c89257b099bddefacd4640865b",
              "data-structure/heap/max-heap.ts": "e11fff5efd124e2d636f0f42c475ae593091a416a11dad840c67ed2fa55a986c",
              "data-structure/heap/min-heap.ts": "e4271b7630458178c4dd8b76f6fce5fa8f00f86370043f6adf1ae51828f1efb8"
            },
            "requires": []
          },
          {
            "name": "data-structure-priority-queue",
            "packageName": "@hermes/data-structure-priority-queue",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/priority-queue/index.ts": "70ea451cc731c2201a617be3e8a00f30b4c6c34d40cddf1d6cb65371082365e9",
              "data-structure/priority-queue/priority-queue.ts": "0ce8a7bd626cb435af32b02d960d8fb56689ad7600bea549ba4170f98c8dea42"
            },
            "requires": [
              {
                "packageName": "@hermes/data-structure-heap",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "algorithm-graph-topology-sort",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-graph-topology-sort",
            "packageName": "@hermes/algorithm-graph-topology-sort",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/graph/topology-sort/index.ts": "a186bbbcadcc95a17f797d110a2ea7719eaa8411f3cc1a4c2f9b9acae03c4658",
              "algorithm/graph/topology-sort/topology-sort.ts": "6741243f15778938f47513a02b2fad490b984c2dc6a43db89e193ac215ee2e67"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-search-binary-search",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-search-binary-search",
            "packageName": "@hermes/algorithm-search-binary-search",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/search/binary-search/binary-search.ts": "8a3741375b9651549c019eafb2cfe528a287d1137f60110f0a5c1461ef37f3e6",
              "algorithm/search/binary-search/index.ts": "4926dbc60fea8d4236d9ae01bda0584c44555551d080dc2ee1d0b926314a00d9"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-string-kmp",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-string-kmp",
            "packageName": "@hermes/algorithm-string-kmp",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/string/kmp/index.ts": "d3d3282ae72c35bd70fa7b36a0561c4598ce8bcc739cf54d6d4ac0d6638a252c",
              "algorithm/string/kmp/kmp.ts": "845dd63dc211d0c40cd34a7486864ba6a5dc0f6080a65e39369ea84996dd9c2c"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-string-z-algorithm",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-string-z-algorithm",
            "packageName": "@hermes/algorithm-string-z-algorithm",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/string/z-algorithm/index.ts": "b2921d712e8a6b977773b8b9266dce189d85b5a91b51613b9bd56a7a4325edb1",
              "algorithm/string/z-algorithm/z-algorithm.ts": "d65d296a173abf32629c96b0b254c308a431d1661289f5024fba1bf03abe0e2f"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-tree-avl-tree",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-tree-avl-tree",
            "packageName": "@hermes/algorithm-tree-avl-tree",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/tree/avl-tree/avl-tree.ts": "da08847994e4d1c1ab10863ed381dc008876429f47c28136c79ac88c3d531325",
              "algorithm/tree/avl-tree/index.ts": "ce816726b40a95dd9f0ca58fd91d3d94b721362a2c04439204c7fdad2859b42b"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-tree-binary-search-tree",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-tree-binary-search-tree",
            "packageName": "@hermes/algorithm-tree-binary-search-tree",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/tree/binary-search-tree/binary-search-tree.ts": "aac15f79bb8942ff1cd0407967d8f1a2745c66d7f74d6d7f4be6d65155f1b094",
              "algorithm/tree/binary-search-tree/index.ts": "4ef11fb567ab277830a448f0f7760c1ca4b9b4f15743ff6c44591e24e85be80b"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "algorithm-tree-lca",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "algorithm-tree-lca",
            "packageName": "@hermes/algorithm-tree-lca",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "algorithm/tree/lca/index.ts": "5e0ba044f2add09886baa6f91f014fc282dfc37a952af58a63683fa3269f3ffc",
              "algorithm/tree/lca/lca.ts": "d3b17e5c9ac52c7c6e278b9d0f5d4011078597c14771fadd9582eb9ddeffdb37"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-chunk",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-chunk",
            "packageName": "@hermes/array-chunk",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/chunk/chunk.ts": "26272e73b3b9b9948a3986a178f34b5200174d6c0b7fd15f7d569c4d35e486e7",
              "array/chunk/index.ts": "2eef28154d4d894b5daff8b778f9fe860806c29216cac1137a7a0cb405e9f3c2"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-compact",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-compact",
            "packageName": "@hermes/array-compact",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/compact/compact.ts": "def2b827ea3927443c18510c904cb223b3359fb6d17415abeb24f55ed0d0c014",
              "array/compact/index.ts": "fb1e8a939663a1f9066619895e9563420ef5ee21efd1af86383f303b5e8ba2db"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-count-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-count-by",
            "packageName": "@hermes/array-count-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/count-by/count-by.ts": "1c3708c08b26bab74ce0c9e936ba36f6ae303cf2f7457a831c03bf54b7b1a8c3",
              "array/count-by/index.ts": "9b3a189ac0b034843b2a6ed3ff81f66b8f71ea1f0ec150ee3283a12075af6c28"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-difference",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-difference",
            "packageName": "@hermes/array-difference",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/difference/difference.ts": "dcda33ad4c7f0a2fedb20ed34ff45def3b1dd67ac42fb14f3682ae7d14e78f53",
              "array/difference/index.ts": "0568237020c94492037c281d943f0d5102c38ade5621de10825c2d4830ee491d"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-drop",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-drop",
            "packageName": "@hermes/array-drop",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/drop/drop.ts": "3105fe493c357f79458ecb3a9cd19f4b4c75ed6e58e68b022547b70bb0c2074e",
              "array/drop/index.ts": "2db3e4cf5f3451b12d9e0e6476dd3fd1e3c8ac98603f841e804b2fc3ccc3ab68"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-group-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-group-by",
            "packageName": "@hermes/array-group-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/group-by/group-by.ts": "e404cba33f936b28716d2e0ccffa3a562cb5b6a2fb8eb0619c7162f86981c05b",
              "array/group-by/index.ts": "09d7546402fb2975526253619cd2bb8461d751744b8ebe4d704988750fb307c0"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-intersection",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-intersection",
            "packageName": "@hermes/array-intersection",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/intersection/index.ts": "4f7f2876eb6e961e0ff3be3c977ebb47e0c88f86b5f48f5b3230377ff86bc0a0",
              "array/intersection/intersection.ts": "77fabbb1684d0ca30d0d2e87935ae3cc867da1e794803d9cd1e07d79231b407c"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-key-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-key-by",
            "packageName": "@hermes/array-key-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/key-by/index.ts": "76e0de494e2a0cf8940f4d6e071b42e98d70dd05fcf59a83db2feebf0b12291a",
              "array/key-by/key-by.ts": "cd3469628cf16f11d38390e729a8444dd321dcac037940f08b6208d699a05975"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-max-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-max-by",
            "packageName": "@hermes/array-max-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/max-by/index.ts": "cf5fc393a1599800b5d5c48a5d2dc1b134dd3136e20876f0c136860c196b09d4",
              "array/max-by/max-by.ts": "5d579181698ac951cefccf082d6f1e5210d5db0c7914222184f6d55017f15adc"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-min-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-min-by",
            "packageName": "@hermes/array-min-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/min-by/index.ts": "270254f3f313d99f4cf267cad1d2ed4bffe4144a643441b853adfdc62d1e5323",
              "array/min-by/min-by.ts": "d64400ecfd8d57209f35dce9e3d73d72d77a75c04852f253516ab926f4af0747"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-partition",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-partition",
            "packageName": "@hermes/array-partition",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/partition/index.ts": "c84a6433afc3daf796374f35b7b291006f405b0d82d923710c3efd839792bde7",
              "array/partition/partition.ts": "31c82ba44a0c49be00a475c2cdab5c55277f69374447bb819c913e8a76cc05b3"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-range",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-range",
            "packageName": "@hermes/array-range",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/range/index.ts": "d6a9fef981e652e34c9d57b4e325c1aaf2811bd6a85327f7c884de8ea99e6531",
              "array/range/range.ts": "52a3233e7f8200cf6ad9a349199edcc21fbe85672ec1a42ec3e336e9bc844615"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-sample",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-sample",
            "packageName": "@hermes/array-sample",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/sample/index.ts": "92cd264ab1ef750b0214c52d5f47e441b36f9a135eb34f1d832d4a15bbc34378",
              "array/sample/sample.ts": "30b2429787b2a85497ee444dbbb6c57f3bf68b6b3484a7535e1bddb806dfb978"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-shuffle",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-shuffle",
            "packageName": "@hermes/array-shuffle",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/shuffle/index.ts": "d1281f8e789826db34566283774ab4c9d505c05e526a628a0231923ee8b5e738",
              "array/shuffle/shuffle.ts": "86c562c5fb5be6a6bb316e171ba96c01fa3ccea247faaca59cc4712bbee0536f"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-sort-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-sort-by",
            "packageName": "@hermes/array-sort-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/sort-by/index.ts": "ce17855354d44e29c824d97fb41e692d60881547c1ab64014f509d0dfbe0ba29",
              "array/sort-by/sort-by.ts": "2aecbf87058a43cadd3266e32c20d88e3494021f4c0fbb2141d8c0c91ffa581f"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-sum-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-sum-by",
            "packageName": "@hermes/array-sum-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/sum-by/index.ts": "33a8ad679df880d5fbee32811baf97262c849d6efee0daa73b93f92af21e9882",
              "array/sum-by/sum-by.ts": "439169b9fba19bf0a5a850e64833dab95aaa3823d2816212a422c84224dde619"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-take",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-take",
            "packageName": "@hermes/array-take",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/take/index.ts": "294f4bb7d383fbd4d4e3ab898f068e21d3d6bfa1407b747d6441ed214fa814f8",
              "array/take/take.ts": "66ef5a8167992feb048efc9b096b8676859f2df776324ba425f738eeb75853da"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-union",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-union",
            "packageName": "@hermes/array-union",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/union/index.ts": "f6ee75934da5e2272e3a2516fcc54793160b860470ab4d1f580bb39573469005",
              "array/union/union.ts": "7d88f8a650d3e5c6882e7c984532d0685d7db3c4e54ef795069aab98f88e626f"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-unique",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-unique",
            "packageName": "@hermes/array-unique",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/unique/index.ts": "cda3fbe070f81682a29fa5628f67d77313072f68a03917ca4af2ab89a0439fe0",
              "array/unique/unique.ts": "63dcf503d9e2d5422f0ee7d0f938b6e62e195127b3f9c2aabee8f42dbc7680ac"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-unique-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-unique-by",
            "packageName": "@hermes/array-unique-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/unique-by/index.ts": "016e9acb90587289f602d8d64f69aace913da48c656f6f87bcedde8264ceb05c",
              "array/unique-by/unique-by.ts": "4fe8a57ffc16ddffceb7f51e3112579f12290ae3610e97782bb62f8bd4b66fcb"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-windowed",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-windowed",
            "packageName": "@hermes/array-windowed",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/windowed/index.ts": "ec312f4f56df2a6ca3352bd272b9ad7390c51a72d2c6330be83a88b054cde2ae",
              "array/windowed/windowed.ts": "847464bc642e3b38c838fcfd00838059b7f0fe1251a3a9ff8983eab7d42f0e9f"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "array-zip",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "array-zip",
            "packageName": "@hermes/array-zip",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "array/zip/index.ts": "5ffaf0268d688cb294db900b9d984b469afb39eb3933994cc128e20cef40839e",
              "array/zip/zip.ts": "0a619e86c9785b070e05967c04973b772a65da7ac61fa7c53413e695fa36e31e"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "boolean-parse-boolean",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "boolean-parse-boolean",
            "packageName": "@hermes/boolean-parse-boolean",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "boolean/parse-boolean/index.ts": "e5b4d76c3edea464b2e46cdfba6515fefb404d0327cc9b54e73f013b2e5513ac",
              "boolean/parse-boolean/parse-boolean.ts": "2f599f2c6b39c04296e787a873cb949b657cb0623693df7058ca7bf3969d65b6"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "boolean-toggle",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "boolean-toggle",
            "packageName": "@hermes/boolean-toggle",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "boolean/toggle/index.ts": "baa0f9fabde8d6eab426db28dbf34408a138bf52879c3fa01c3822381810bfda",
              "boolean/toggle/toggle.ts": "56ea40f2935e6603e14d9ed08f5c66875f25373906f6015718f7c039f7080ac8"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "boolean-xor",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "boolean-xor",
            "packageName": "@hermes/boolean-xor",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "boolean/xor/index.ts": "0687b81ffcd7d555e4b2579b8817264a408ba2aea167e45f8e8ee08c34ed2612",
              "boolean/xor/xor.ts": "9f0f35949e05fa823394ff2957307443ccbc5df3718e4468a6b5fd4151e579d9"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "data-structure-deque",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-deque",
            "packageName": "@hermes/data-structure-deque",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/deque/deque.ts": "1b9884ef801a2c204d4b5e249ef19a072ae52c37d99717374332886ae69d70a1",
              "data-structure/deque/index.ts": "581808b1065657e439d0e6257c7ba9c415bb3b82d202882430d2b6e5044042c8"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "data-structure-fenwick-tree",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-fenwick-tree",
            "packageName": "@hermes/data-structure-fenwick-tree",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/fenwick-tree/fenwick-tree.ts": "67c88c2f39bc9fa94732eb6b24f4886ef65fd42029bd62d6e26cc5d6581ac1f9",
              "data-structure/fenwick-tree/index.ts": "1c2a996d4b9ab9deda5d0725244344befae5b65f19d162981662b68305de8084"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "data-structure-heap",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-heap",
            "packageName": "@hermes/data-structure-heap",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/heap/heap.ts": "68fc95274e5a2234fc3992cd1cba59e523050d55ae3a842bfbac30943b24f6f6",
              "data-structure/heap/index.ts": "d84ec9b2413aa9020e3c6ab99b9589328ae543c89257b099bddefacd4640865b",
              "data-structure/heap/max-heap.ts": "e11fff5efd124e2d636f0f42c475ae593091a416a11dad840c67ed2fa55a986c",
              "data-structure/heap/min-heap.ts": "e4271b7630458178c4dd8b76f6fce5fa8f00f86370043f6adf1ae51828f1efb8"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "data-structure-priority-queue",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-heap",
            "packageName": "@hermes/data-structure-heap",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/heap/heap.ts": "68fc95274e5a2234fc3992cd1cba59e523050d55ae3a842bfbac30943b24f6f6",
              "data-structure/heap/index.ts": "d84ec9b2413aa9020e3c6ab99b9589328ae543c89257b099bddefacd4640865b",
              "data-structure/heap/max-heap.ts": "e11fff5efd124e2d636f0f42c475ae593091a416a11dad840c67ed2fa55a986c",
              "data-structure/heap/min-heap.ts": "e4271b7630458178c4dd8b76f6fce5fa8f00f86370043f6adf1ae51828f1efb8"
            },
            "requires": []
          },
          {
            "name": "data-structure-priority-queue",
            "packageName": "@hermes/data-structure-priority-queue",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/priority-queue/index.ts": "70ea451cc731c2201a617be3e8a00f30b4c6c34d40cddf1d6cb65371082365e9",
              "data-structure/priority-queue/priority-queue.ts": "0ce8a7bd626cb435af32b02d960d8fb56689ad7600bea549ba4170f98c8dea42"
            },
            "requires": [
              {
                "packageName": "@hermes/data-structure-heap",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "data-structure-queue",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-queue",
            "packageName": "@hermes/data-structure-queue",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/queue/index.ts": "5449262477397ff04d1248c5b2fd488b7f582aea4f75029544c99b3ff331796e",
              "data-structure/queue/queue.ts": "bdbe6a42bde34b0ddcd9a65c15fc562919eb0d68bff18e8c7162f76d3fcf9119"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "data-structure-segment-tree",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-segment-tree",
            "packageName": "@hermes/data-structure-segment-tree",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/segment-tree/index.ts": "3b908606aceb4cc3b15bda6e2102b0e63e94cc3b9b2d87a2a170968ea9fd59c7",
              "data-structure/segment-tree/segment-tree.ts": "205bb812ccefa143ecaf72e863209d74231b5c4b1e065dd2c5ae64a1081daf68"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "data-structure-trie",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-trie",
            "packageName": "@hermes/data-structure-trie",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/trie/index.ts": "fff54fa5b0b25225ff37d8627396902a67bd6949524c362068da2013cdd0af2e",
              "data-structure/trie/trie.ts": "e3befa9733eaef3cc6d72702f8c6b02f60935e2c82085f76fd65b097945412f9"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "data-structure-union-find",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-union-find",
            "packageName": "@hermes/data-structure-union-find",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/union-find/index.ts": "024399647096d798a1263b9e2e8ca16c512e69f55d0799831445236f9186d8fa",
              "data-structure/union-find/union-find.ts": "9a23ce526b297a8b7d477c06d0f10be9000014208a61d44955edfe2671064f21"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "dom-attribute",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "dom-attribute",
            "packageName": "@hermes/dom-attribute",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "dom/attribute/attribute.ts": "0ffa49b8a742f14a05683304d12661d71d228f2a29cb0203e047f82ac3c66e36",
              "dom/attribute/index.ts": "b58ef7a3bf98ab8447c32980d5cd2d906231f7f772fa18ac802a97a47a658204"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "dom-class-name",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "dom-class-name",
            "packageName": "@hermes/dom-class-name",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "dom/class-name/class-name.ts": "895ce7b801e0ffc63d1346b6d420d6bc8a26a20e8f6917cf78ddf5c45a02120a",
              "dom/class-name/index.ts": "406840891f7e3defafe0b2536db55c6381e1a9b7bae876936358f75679351b08"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "dom-is-element",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "dom-is-element",
            "packageName": "@hermes/dom-is-element",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "dom/is-element/index.ts": "aca97e18d76d39334305850065a580d6f6c67a770095476e04bea7c97fbd95ad",
              "dom/is-element/is-element.ts": "15a86226d933e3d1198547defc304c395223cd1caa1c02ae25ff3b6b1294da5e"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "dom-query",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "dom-query",
            "packageName": "@hermes/dom-query",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "dom/query/index.ts": "4c39b9f6920a9b265b02974e4c349f9e778fc038198e04a6cedc9432fa256ff5",
              "dom/query/query.ts": "5c04b31518f33f14a1c5c366916d6602e930c0814d0d135c0ced3ed4837ffec2"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "http-content-type",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "http-content-type",
            "packageName": "@hermes/http-content-type",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "http/content-type/content-type.ts": "e3e13194fa873ab134876d92274bdd0ddd83f3cf8e4746973186d50194327f91",
              "http/content-type/index.ts": "fb74c0d566bf7e3d44a4ba91a11ecd1c30f36466776930b2fba5e8d0b5c1c277"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "http-header",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "http-header",
            "packageName": "@hermes/http-header",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "http/header/header.ts": "a9234ae918fc017872ffac0b8e24c39da8ca88a9815a56acdb75aa2beb8906a7",
              "http/header/index.ts": "90037599f35339e06a966b75f6bc71394fcc11014d1fbf3d0851043975e610b1"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "http-method",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "http-method",
            "packageName": "@hermes/http-method",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "http/method/index.ts": "f204bf411474904f91e8ceaf66bbe62baeac55561c76e97cec009c83ef729eec",
              "http/method/method.ts": "5328a01b43db83e4de30129625e3ff34c4cda6fbb776a919c1563e9f9bfda32a"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "http-status",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "http-status",
            "packageName": "@hermes/http-status",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "http/status/index.ts": "8715413232bc8d2c753f38920706d1c1a354ce9c9fb3da94abfd8eb43313c083",
              "http/status/status.ts": "9123ab8816da2758aaf43bf92971d6bb1bc2b4a464de6d005cdcc86701f3710e"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-clamp",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-clamp",
            "packageName": "@hermes/number-clamp",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/clamp/clamp.ts": "000ac9ec190fb9f8b9a65e909b9e2fe50bde32f85f7b4c21de35e1780a7daffa",
              "number/clamp/index.ts": "0de3fa17ad88dca5cfc51f3666204872706e1fb7d781e56ca7689974c3b359bc"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-factorial",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-factorial",
            "packageName": "@hermes/number-factorial",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/factorial/factorial.ts": "5bef26f5cc95b392d41b3dd9d90adb71abbaadbb937cc635e2363087d4fe3c6f",
              "number/factorial/index.ts": "22a334c45ff5c3c936bd4625ab14507bb03a81c663eb2ee28d8d7e3f31e11016"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-format-thousands",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-format-thousands",
            "packageName": "@hermes/number-format-thousands",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/format-thousands/format-thousands.ts": "83b7d751965dc53f49f9ea586256121900e521bebbc3f5f7d531d1c6c75552c1",
              "number/format-thousands/index.ts": "db1caaa9da5c0521b8c142ab1ccde6e4cda73bce800d1e6d2172518e01501dd8"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-gcd",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-gcd",
            "packageName": "@hermes/number-gcd",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/gcd/gcd.ts": "579f7d54694397850732238739e15acc259bae77ea646a3ed7a26d1cdfc01213",
              "number/gcd/index.ts": "3aecb144406fca328275ad15ab1e7bfb2d63a643e977e5cdf5dc5c190412cfd4"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-in-range",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-in-range",
            "packageName": "@hermes/number-in-range",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/in-range/in-range.ts": "9f60a04ad7147f477009050e126c9670a62180002b532d34c49f59b446da1696",
              "number/in-range/index.ts": "1311311a22fe33372e50252624cf6802b4675e1cf6752ebbcf67c866e5951b5c"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-is-even",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-is-even",
            "packageName": "@hermes/number-is-even",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/is-even/index.ts": "dc73dba12fba3e24351e813fa6bcadc40f0f477c0c3a9eef7b49e31fa18156e8",
              "number/is-even/is-even.ts": "1f95d2931cfcbd6e8f78f82316306ddae1086d1ad21c607153f3e5fe8616fc99"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-is-odd",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-is-even",
            "packageName": "@hermes/number-is-even",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/is-even/index.ts": "dc73dba12fba3e24351e813fa6bcadc40f0f477c0c3a9eef7b49e31fa18156e8",
              "number/is-even/is-even.ts": "1f95d2931cfcbd6e8f78f82316306ddae1086d1ad21c607153f3e5fe8616fc99"
            },
            "requires": []
          },
          {
            "name": "number-is-odd",
            "packageName": "@hermes/number-is-odd",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/is-odd/index.ts": "375994897f4b212ba122f8434bd0fdc896d0a1b6f7a2cff4acbb194b36b9fb33",
              "number/is-odd/is-odd.ts": "d65b50053bbf248b59812eb937fc14ccb83807241757c73ab53a1cc17ee4a960"
            },
            "requires": [
              {
                "packageName": "@hermes/number-is-even",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "number-lcm",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-gcd",
            "packageName": "@hermes/number-gcd",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/gcd/gcd.ts": "579f7d54694397850732238739e15acc259bae77ea646a3ed7a26d1cdfc01213",
              "number/gcd/index.ts": "3aecb144406fca328275ad15ab1e7bfb2d63a643e977e5cdf5dc5c190412cfd4"
            },
            "requires": []
          },
          {
            "name": "number-lcm",
            "packageName": "@hermes/number-lcm",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/lcm/index.ts": "1c8a6ce3a0131513975fc8824dec32baca68d88c2d045eb41c2bc79a59cbb341",
              "number/lcm/lcm.ts": "5b9e702164941ae3d750758a1db52a3321e0912e7aa1d58d68fdbb546e5b8803"
            },
            "requires": [
              {
                "packageName": "@hermes/number-gcd",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "number-lerp",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-lerp",
            "packageName": "@hermes/number-lerp",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/lerp/index.ts": "1151705220066be99c40d4ced01bb77afcc6d16220840a3363dda25b9ef9d12a",
              "number/lerp/lerp.ts": "b6fe38921b7e1e43185543f17d103ebb8aea0ce5f46767f9c3f0f21b4503cea8"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-percentage",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-percentage",
            "packageName": "@hermes/number-percentage",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/percentage/index.ts": "67c16c541bafcb72247993dcb35407fda6a222ed926b547f0b5a24031e225ec6",
              "number/percentage/percentage.ts": "9517b5f15e862fc23b5a3599a9da06b6315ca45a0642cec1e7dd10baa7f198d2"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-random",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-random",
            "packageName": "@hermes/number-random",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/random/index.ts": "4695c157714c4f0baf3647241c3d9f1d012d1203bb4b0184ad4590267a3952b8",
              "number/random/random.ts": "fcf432b2b85cb208c754426f3949362e12b1abcbe348347997927b47b3116b98"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-random-int",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-random-int",
            "packageName": "@hermes/number-random-int",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/random-int/index.ts": "0b652e1777dc7df6bd4112b063aa939ff71daf656fcde14363a3d6294837fe70",
              "number/random-int/random-int.ts": "befcfb7a411e9c403186c5191fd4c84d812ba089b4fa66b87a0ea1626fbb1c92"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-round",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-round",
            "packageName": "@hermes/number-round",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/round/index.ts": "9a823a5d74c726ea33e6a5f814996f38646230956e7a39363595e02878429c8d",
              "number/round/round.ts": "be4323d11408ee6a9bda444f786a3d2808a65289ce7febcb0e741ebddd3dc437"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-safe-parse-number",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-safe-parse-number",
            "packageName": "@hermes/number-safe-parse-number",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/safe-parse-number/index.ts": "50e853837f309dc8afa46070598360823120e9ce5be7983da47e9f1e42f5fed5",
              "number/safe-parse-number/safe-parse-number.ts": "d7b0c3291ec2e35b4a4f90cdc19fc1fcb5c535794ddbdb5460d48bfe91f9af74"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "number-to-ordinal",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "number-to-ordinal",
            "packageName": "@hermes/number-to-ordinal",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "number/to-ordinal/index.ts": "9031d2ae96bc961c9e242fce4ec8dae50eb80d68e24afd959093fe2fcd879f86",
              "number/to-ordinal/to-ordinal.ts": "a58a8a368cd12c8e34534ef0f6f59f7788638be00636182f1fd09879ed1c6289"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-deep-clone",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-deep-clone",
            "packageName": "@hermes/object-deep-clone",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/deep-clone/deep-clone.ts": "e6c017cff7cebd681730b7ca42f58849a029be87e7265078c0601a8885e70050",
              "object/deep-clone/index.ts": "3f404d12d062eeedc253a7ebca0db8e6b5586a390336b331f1aedfd4e4d38fd0"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-deep-equal",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-deep-equal",
            "packageName": "@hermes/object-deep-equal",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/deep-equal/deep-equal.ts": "cc5ae9f52a11194d8d1bcf1eea2970cc961df5b901a16aa72b3870246a078b02",
              "object/deep-equal/index.ts": "eea901126ad422f8b851168f681c79910da8916fe3ce46c5647883a073389cd6"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-deep-merge",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-deep-merge",
            "packageName": "@hermes/object-deep-merge",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/deep-merge/deep-merge.ts": "08158a4c9027d36ad1a5f7e479b041b383e104a737506fb247513ddd1d561ae8",
              "object/deep-merge/index.ts": "ae91da4157821ce34de00323e1e204b64305ae456e47e9f08f1981cbfcd58f1c"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-defaults",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-defaults",
            "packageName": "@hermes/object-defaults",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/defaults/defaults.ts": "7c5f9b72145fd0bcea248ee7d477162676078b4fb50bfc9fc4ce873a6d750df6",
              "object/defaults/index.ts": "daefdb58272ad9e4e44aedc046297adfc3b12f8d541c00a1e07d7f291c3b372b"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-filter-object",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-filter-object",
            "packageName": "@hermes/object-filter-object",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/filter-object/filter-object.ts": "df08661785354560ec27f4c80bb0e056fa02a6886338469dc58790900f3b613a",
              "object/filter-object/index.ts": "701d75767700e46dc4c20be5d3fb4b78cae4df981fe24b42ff6b6918f8ce3b14"
            },
            "requires": [
              {
                "packageName": "@hermes/type-get-type",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          },
          {
            "name": "type-get-type",
            "packageName": "@hermes/type-get-type",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "type/get-type/get-type.ts": "a7b20a1fadb5d11a188075c1ce7b2cbb2f413a8e34c5a5d23f4de70d61d23067",
              "type/get-type/index.ts": "0fa1d66782d578c8395c77110000c62c1d14c156863eda96e3d8f5dd53bfa330"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-get",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-get",
            "packageName": "@hermes/object-get",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/get/get.ts": "db23b21c02892de3175e8fd97a249618f4cec536a95b88e0d026144bd4d8b811",
              "object/get/index.ts": "d98169ccb9128829f4234b7310e00eea377929b208137419c3e28e5f98bec011"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-has",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-has",
            "packageName": "@hermes/object-has",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/has/has.ts": "377a2155e72327e40d55ce8e7a819708728bf1ba28732804f98b5e1b1d657428",
              "object/has/index.ts": "7c4648b49a5d8d2e101672d324d73116af3aed4a9ae3f88543cf8805f6ba3a2b"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-invert",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-invert",
            "packageName": "@hermes/object-invert",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/invert/index.ts": "3487587f421ea15e7d827e71157612619e7a3663342b90dbde36e4b4565a506e",
              "object/invert/invert.ts": "f25cbb3c832a9fa782171533788d464203683364803c8e6897df665ced9d1ae9"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-map-keys",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-map-keys",
            "packageName": "@hermes/object-map-keys",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/map-keys/index.ts": "84b2ea11e3c274edaf702157a23d2032a856fe9de580bdfa2a38000e918b5b33",
              "object/map-keys/map-keys.ts": "53259e6a74d1a8f1603eaa97d3c093b6ef443e339ea02ac08c29b7e5ea38caf6"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-map-values",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-map-values",
            "packageName": "@hermes/object-map-values",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/map-values/index.ts": "0e043d168c485567574df59096842a9779b9e78dc0cddb6455f510a6fcc91f2b",
              "object/map-values/map-values.ts": "259e842e3750a7ee33d4d10bee74bbf36ffe41a131df433f139922b48aa76523"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-omit",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-omit",
            "packageName": "@hermes/object-omit",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/omit/index.ts": "efb74fd90271734d2b12bcb22fa7f36372fea78ee4828815ff309d5bdde8224a",
              "object/omit/omit.ts": "6d82d1eccead2b78eef3f13e27b8f52177a7be41c4ec71e6afeda2ce41c168c5"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-omit-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-omit-by",
            "packageName": "@hermes/object-omit-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/omit-by/index.ts": "231c854737a066b50feb1e651c303d4712c9c86d8ca41d8602c42bdbb4f47739",
              "object/omit-by/omit-by.ts": "1e8118ef8835d4ce61cba36a933f1cd90b036e12a2466d9485ed6b81d241f3cd"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-pick",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-pick",
            "packageName": "@hermes/object-pick",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/pick/index.ts": "c71413ea3026d40b535c76095f7c0c6e567e720b701b95f21783c669aa27b2ef",
              "object/pick/pick.ts": "5afeb645fb83f44408cb8b04f21a1aa2b2681b94cb4cd8f489b007f9953259ca"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-pick-by",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-pick-by",
            "packageName": "@hermes/object-pick-by",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/pick-by/index.ts": "9b95ed85686e43cb521f001965449ed5876f87023201b8ffded84e197fd1e9ba",
              "object/pick-by/pick-by.ts": "3818173dc5cd52266988d7d3f8b35f0395988180e3ab861ca7b93aee57d79a5e"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "object-set",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "object-set",
            "packageName": "@hermes/object-set",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "object/set/index.ts": "93efd87d33d4e53399e635b8793d41e2e0487a75a9fbb9441253518f4a2176a0",
              "object/set/set.ts": "fcfe51592f66bf4a988295492afb4da00813b7b5cfa7b44a08523b96976d70b8"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-capitalize",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-capitalize",
            "packageName": "@hermes/string-capitalize",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/capitalize/capitalize.ts": "5a0e0be0791fca90d9bff52caa6332aaba68b28b9c3a13a509edeb4eaacfdf42",
              "string/capitalize/index.ts": "b7459d66815642143de2052c5beae645838c5c209c7c284434d2e563ae48f592"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-change-case",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-capitalize",
            "packageName": "@hermes/string-capitalize",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/capitalize/capitalize.ts": "5a0e0be0791fca90d9bff52caa6332aaba68b28b9c3a13a509edeb4eaacfdf42",
              "string/capitalize/index.ts": "b7459d66815642143de2052c5beae645838c5c209c7c284434d2e563ae48f592"
            },
            "requires": []
          },
          {
            "name": "string-change-case",
            "packageName": "@hermes/string-change-case",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/change-case/change-case.ts": "17226a9862e60a042053c95e95c4f7569b52dab204a202cc33e2873656fc612b",
              "string/change-case/index.ts": "38f2d282ebf908ff1bb47c4a05018fc4dc918364f4792c749aad43ddab2794ec"
            },
            "requires": [
              {
                "packageName": "@hermes/string-capitalize",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "@hermes/string-char",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          },
          {
            "name": "string-char",
            "packageName": "@hermes/string-char",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/char/char.ts": "5df12fd4b8f6d39e2bcdee7f373775ee94a15bf8e49026d9354f59554267277b",
              "string/char/index.ts": "7c99a1bd333a3ca48e5f8fb6f1f631d5517d0cbc74cbafe249a7d46d4a396766"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-char",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-char",
            "packageName": "@hermes/string-char",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/char/char.ts": "5df12fd4b8f6d39e2bcdee7f373775ee94a15bf8e49026d9354f59554267277b",
              "string/char/index.ts": "7c99a1bd333a3ca48e5f8fb6f1f631d5517d0cbc74cbafe249a7d46d4a396766"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-count-occurrences",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-count-occurrences",
            "packageName": "@hermes/string-count-occurrences",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/count-occurrences/count-occurrences.ts": "42bbe6d6387e737f66c850426fcff5fa96c0d0b8ea03c80494f8f40a79034df6",
              "string/count-occurrences/index.ts": "1f180f215aa44599210ef13ef85f0424ae18cb295ccb201e4482bcf006782034"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-escape-html",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-escape-html",
            "packageName": "@hermes/string-escape-html",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/escape-html/escape-html.ts": "06663d46950d408101e190344dede3eeb98808a96e0804dcfe2b73c5ae3f8f18",
              "string/escape-html/index.ts": "b3c2a104e2965c1d8a833c80346443ccb06e4d8edcb9bc48d61d1616fe2a0956"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-get-decorated-string",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-get-decorated-string",
            "packageName": "@hermes/string-get-decorated-string",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/get-decorated-string/get-decorated-string.ts": "c976bf8847bac53119f866519031e20b3e32b04a46f15d2b919877242a10cd1e",
              "string/get-decorated-string/index.ts": "58fe99926268097c5d719417482bf1cb80c807ffe9994c0e371c2f364299b456"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-is-blank",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-is-blank",
            "packageName": "@hermes/string-is-blank",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/is-blank/index.ts": "e719cb17185b5d628b6448761d943d749c91f39bb2a798f0b1cfd03aa7f1c901",
              "string/is-blank/is-blank.ts": "505db33613c3c26332fb7dacefd0b014b70150f16d96745a1ff9b741e6d6d866"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-mask",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-mask",
            "packageName": "@hermes/string-mask",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/mask/index.ts": "419092da22c4bf9bcf9df16ce918d9503b0eef97d1931ef7eecc187745b96d1f",
              "string/mask/mask.ts": "43edab9f34be4a5dd57bce2de88549f107b8b6b13c16955d44c56f5ad1c38846"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-pad",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-pad",
            "packageName": "@hermes/string-pad",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/pad/index.ts": "4400f7f65a5f3c3125174c2a9a28e7861c506e2c3cc45278fcca7010f806ebfc",
              "string/pad/pad.ts": "426118b827374f211a520646a400d2ca890fec2d844dad96e881132781813721"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-random-string",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-random-string",
            "packageName": "@hermes/string-random-string",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/random-string/index.ts": "dd9c104708b59d5a969688fa5b30b1b4f4fc0b47d5d79ad4938cbdad490b0a39",
              "string/random-string/random-string.ts": "d95810906421aca5454a2c33a367a4b0a3d09ef64b89285764e81d926c52e925"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-reverse",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-reverse",
            "packageName": "@hermes/string-reverse",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/reverse/index.ts": "4c9e3729a9b99528e64fb565510bf9e70ba6ebc59ff20a726316fffd1a21a617",
              "string/reverse/reverse.ts": "eb05516d272bbf316b2d341a5b998440ca8fd2ed5dbc97c52f7146038c0dc56a"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-slugify",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-slugify",
            "packageName": "@hermes/string-slugify",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/slugify/index.ts": "1eeede3438da1ea25bab282a82006ba183d9bb474bab7deae52cd838f3993075",
              "string/slugify/slugify.ts": "7a5e1a4a15fe890b243d9ba173b458c5827a0197f5186e1f4cc97b32c2ccb7cb"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-strip-tags",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-strip-tags",
            "packageName": "@hermes/string-strip-tags",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/strip-tags/index.ts": "d67517bc76e5372a67dd117b0e1506b0c5d4e5e8d4d4197f319137460054ad8e",
              "string/strip-tags/strip-tags.ts": "a6acd2474c1e31db5373b7f2aca9a5d67e3300b3caf0a27832171f5cef94d998"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-template",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-template",
            "packageName": "@hermes/string-template",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/template/index.ts": "9833d97b9d9b4011da60f02cd7ca29b102881a09f2d126852fa0cbe488391217",
              "string/template/template.ts": "8c90431f1f415f3119b70e0d3ee12cd971e91250664d0ee8fe7c0df2f03f9e37"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-truncate",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-truncate",
            "packageName": "@hermes/string-truncate",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/truncate/index.ts": "e833d58d595a50861200693e0c89d150bd9581d1bedda19e9a51a651d0c1a603",
              "string/truncate/truncate.ts": "2d2612b386412f766a8dd4976bd288a93066412c156aa83e37c4d5682ce557bd"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-truncate-middle",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-truncate-middle",
            "packageName": "@hermes/string-truncate-middle",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/truncate-middle/index.ts": "005a3e1db5a9a1e7d85a5c507f902a8971a88d58f960e0ef5a9b72895369c8a5",
              "string/truncate-middle/truncate-middle.ts": "7303b2901c7c4175af83fc795b98453b99e014d520a232cf41784f490dc6ff9b"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "string-uuid",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "string-uuid",
            "packageName": "@hermes/string-uuid",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "string/uuid/index.ts": "c763e01667ec6011d5dbec4544fc4e66cb5506497f4186a2b6d6c37bd306b5c3",
              "string/uuid/uuid.ts": "67760191f9abaf10c3128392ab62bc6528db9d79b3509de60d98b82b9baf2d20"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "type-get-type",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "type-get-type",
            "packageName": "@hermes/type-get-type",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "type/get-type/get-type.ts": "a7b20a1fadb5d11a188075c1ce7b2cbb2f413a8e34c5a5d23f4de70d61d23067",
              "type/get-type/index.ts": "0fa1d66782d578c8395c77110000c62c1d14c156863eda96e3d8f5dd53bfa330"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "type-is-type-of",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "type-get-type",
            "packageName": "@hermes/type-get-type",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "type/get-type/get-type.ts": "a7b20a1fadb5d11a188075c1ce7b2cbb2f413a8e34c5a5d23f4de70d61d23067",
              "type/get-type/index.ts": "0fa1d66782d578c8395c77110000c62c1d14c156863eda96e3d8f5dd53bfa330"
            },
            "requires": []
          },
          {
            "name": "type-is-type-of",
            "packageName": "@hermes/type-is-type-of",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "type/is-type-of/index.ts": "7f61ae1bf13ca97d83b95f883028849196c1d6b51d4945adca9ecc48a5d24bc3",
              "type/is-type-of/is-type-of.ts": "7759f8033af3a4efe735cdab3a4396086df378117fe8f63ec3dafe66348ca59f"
            },
            "requires": [
              {
                "packageName": "@hermes/type-get-type",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "util-mutex",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "data-structure-queue",
            "packageName": "@hermes/data-structure-queue",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "data-structure/queue/index.ts": "5449262477397ff04d1248c5b2fd488b7f582aea4f75029544c99b3ff331796e",
              "data-structure/queue/queue.ts": "bdbe6a42bde34b0ddcd9a65c15fc562919eb0d68bff18e8c7162f76d3fcf9119"
            },
            "requires": []
          },
          {
            "name": "util-mutex",
            "packageName": "@hermes/util-mutex",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "util/mutex/index.ts": "feccec2ce1467fe3aff1351ac0fd353fcb3f7a3f429ee1d82957a4c4be5dad18",
              "util/mutex/mutex.ts": "939e603cfb3c5657f8f18b1c0e9d9d88d1cb25699d055e9b237a63945071133a"
            },
            "requires": [
              {
                "packageName": "@hermes/data-structure-queue",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              }
            ]
          }
        ]
      }
    },
    {
      "name": "util-url-parser",
      "scope": "core",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "util-url-parser",
            "packageName": "@hermes/util-url-parser",
            "version": "1.0.0",
            "scope": "core",
            "files": {
              "util/url-parser/index.ts": "212d7ca53bb77b78ba4e9999d7d667cfe6ff19f8d99ff5619bf409bf9799a111",
              "util/url-parser/url-parser.ts": "36920cad52f128516f07d4d2d6e504050e5faa315767d108e849363fdc97d6ed"
            },
            "requires": []
          }
        ]
      }
    },
    {
      "name": "lint-fsd",
      "scope": "lib",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "0.1.0",
        "status": "verified",
        "modules": [
          {
            "name": "lint-fsd",
            "packageName": "@hermes/lint-fsd",
            "version": "0.1.0",
            "scope": "lib",
            "files": {
              "lint/fsd/fsd.ts": "7bca7aae487a8d2bad71f2d152b8420a2cd7a8259c514224b6df764fe7642164",
              "lint/fsd/import-listener.ts": "b07c96183e23f6e8902b1451fc350cd0eb5e87c0ed77626376fffa870c6434bc",
              "lint/fsd/index.ts": "b5a08b38570e5094eacf089ecbe5bf0ac12692671bc266c923796172b8a436a8",
              "lint/fsd/options.ts": "e24e3fb0cf0ab12cda93614ae19fcd1762d2b23c746a087390f612113195193b",
              "lint/fsd/rules/fsd-layer-imports.ts": "23cee966cf7d230e2762c70d5c115fc49a26a9ccf8ba33a2d2bedb41f244ea0d",
              "lint/fsd/rules/fsd-public-api.ts": "474eb3d91081db8b31a678990c19ddda346125a54c1a10a7cf7d2ed07eb41b28",
              "lint/fsd/rules/fsd-slice-segments.ts": "57d72120b747d4d091ae09abc99e8f821c7ebca1ee4e992d1fc9fe1ab29ad275"
            },
            "requires": [
              {
                "packageName": "eslint",
                "range": "^9.0.0 || ^10.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          }
        ]
      }
    },
    {
      "name": "tailwindcss-class-variant",
      "scope": "lib",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "tailwindcss-class-variant",
            "packageName": "@hermes/tailwindcss-class-variant",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/class-variant/class-variant.ts": "81597cbd255de9e81ca2a7c9a9ce7bdb0784edc00e5d532f9365380f64167b3b",
              "tailwindcss/class-variant/index.ts": "d81d51825e3a1828a2eb035c601a0e086f75721cec25934f215a5bea24cf78b8"
            },
            "requires": [
              {
                "packageName": "@hermes/tailwindcss-tw-merge-config",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "tailwind-variants",
                "range": "^3.2.2",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          },
          {
            "name": "tailwindcss-tw-merge-config",
            "packageName": "@hermes/tailwindcss-tw-merge-config",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/tw-merge-config/index.ts": "f46c44a9ae58123fb0f77ebba87264a958be681e5a6409c53553cf14bc541c8a",
              "tailwindcss/tw-merge-config/tw-merge-config.ts": "63f0b9488ee1ad67b0e18be74e3efd059e932b33be438c58149097566ea0c1bd"
            },
            "requires": [
              {
                "packageName": "tailwind-variants",
                "range": "^3.2.2",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          }
        ]
      }
    },
    {
      "name": "tailwindcss-cn",
      "scope": "lib",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "tailwindcss-cn",
            "packageName": "@hermes/tailwindcss-cn",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/cn/cn.ts": "9cadaedde5edafbc1a8614f22706a4935a7fd60a68511fefaa245b48fb736f6c",
              "tailwindcss/cn/index.ts": "5b26e10388463d639143e754687fe4faf2ffc7c61c9271d760eb22bcd8ddf26f"
            },
            "requires": [
              {
                "packageName": "@hermes/tailwindcss-tw-merge-config",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "clsx",
                "range": "^2.1.1",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwind-merge",
                "range": "^3.6.0",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          },
          {
            "name": "tailwindcss-tw-merge-config",
            "packageName": "@hermes/tailwindcss-tw-merge-config",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/tw-merge-config/index.ts": "f46c44a9ae58123fb0f77ebba87264a958be681e5a6409c53553cf14bc541c8a",
              "tailwindcss/tw-merge-config/tw-merge-config.ts": "63f0b9488ee1ad67b0e18be74e3efd059e932b33be438c58149097566ea0c1bd"
            },
            "requires": [
              {
                "packageName": "tailwind-variants",
                "range": "^3.2.2",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          }
        ]
      }
    },
    {
      "name": "tailwindcss-create-tailwind-css",
      "scope": "lib",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "tailwindcss-class-variant",
            "packageName": "@hermes/tailwindcss-class-variant",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/class-variant/class-variant.ts": "81597cbd255de9e81ca2a7c9a9ce7bdb0784edc00e5d532f9365380f64167b3b",
              "tailwindcss/class-variant/index.ts": "d81d51825e3a1828a2eb035c601a0e086f75721cec25934f215a5bea24cf78b8"
            },
            "requires": [
              {
                "packageName": "@hermes/tailwindcss-tw-merge-config",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "tailwind-variants",
                "range": "^3.2.2",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          },
          {
            "name": "tailwindcss-cn",
            "packageName": "@hermes/tailwindcss-cn",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/cn/cn.ts": "9cadaedde5edafbc1a8614f22706a4935a7fd60a68511fefaa245b48fb736f6c",
              "tailwindcss/cn/index.ts": "5b26e10388463d639143e754687fe4faf2ffc7c61c9271d760eb22bcd8ddf26f"
            },
            "requires": [
              {
                "packageName": "@hermes/tailwindcss-tw-merge-config",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "clsx",
                "range": "^2.1.1",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwind-merge",
                "range": "^3.6.0",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          },
          {
            "name": "tailwindcss-create-tailwind-css",
            "packageName": "@hermes/tailwindcss-create-tailwind-css",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/create-tailwind-css/create-tailwind-css.ts": "71bc860e4b2812016b460096b923d7898ba9d841e1f2c7a3f969b6dd6a875bd5",
              "tailwindcss/create-tailwind-css/index.ts": "26518a78f0665fe5f8dac13ff5b7467e1b4978d285141a5203ef63da2626a748"
            },
            "requires": [
              {
                "packageName": "@hermes/tailwindcss-class-variant",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "@hermes/tailwindcss-cn",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "@hermes/tailwindcss-tw-merge-config",
                "range": "^1.0.0",
                "kind": "dependency",
                "internal": true,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          },
          {
            "name": "tailwindcss-tw-merge-config",
            "packageName": "@hermes/tailwindcss-tw-merge-config",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/tw-merge-config/index.ts": "f46c44a9ae58123fb0f77ebba87264a958be681e5a6409c53553cf14bc541c8a",
              "tailwindcss/tw-merge-config/tw-merge-config.ts": "63f0b9488ee1ad67b0e18be74e3efd059e932b33be438c58149097566ea0c1bd"
            },
            "requires": [
              {
                "packageName": "tailwind-variants",
                "range": "^3.2.2",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          }
        ]
      }
    },
    {
      "name": "tailwindcss-tw-merge-config",
      "scope": "lib",
      "directory": "packages/lib/hermes/src",
      "source": {
        "catalogVersion": "0.3.3",
        "requestedVersion": "1.0.0",
        "status": "verified",
        "modules": [
          {
            "name": "tailwindcss-tw-merge-config",
            "packageName": "@hermes/tailwindcss-tw-merge-config",
            "version": "1.0.0",
            "scope": "lib",
            "files": {
              "tailwindcss/tw-merge-config/index.ts": "f46c44a9ae58123fb0f77ebba87264a958be681e5a6409c53553cf14bc541c8a",
              "tailwindcss/tw-merge-config/tw-merge-config.ts": "63f0b9488ee1ad67b0e18be74e3efd059e932b33be438c58149097566ea0c1bd"
            },
            "requires": [
              {
                "packageName": "tailwind-variants",
                "range": "^3.2.2",
                "kind": "dependency",
                "internal": false,
                "optional": false
              },
              {
                "packageName": "tailwindcss",
                "range": "^4.0.0",
                "kind": "peer",
                "internal": false,
                "optional": true
              }
            ]
          }
        ]
      }
    }
  ]
};
