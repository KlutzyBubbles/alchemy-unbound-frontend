import update from 'immutability-helper'
import type { FC } from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import type { DropTargetMonitor, XYCoord } from 'react-dnd'
import { useDrop } from 'react-dnd'

import { MainElement } from './MainElement'
import { ItemTypes } from './Constants'
import { Recipe, RecipeElement } from '../common/types'
import { CustomDragLayer } from './DragLayer'
import Split from 'react-split';
import { Button, Row } from 'react-bootstrap'
import { SideElement } from './SideElement'
import { SideContainer } from './SideContainer'
import { IoHeart, IoHeartOutline, IoInformationCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { AnimatePresence, motion, useAnimate, useAnimation } from 'framer-motion'
import { ModalOption } from './Main'
import { DragItem } from './types'
import { getXY, hasProp } from './Utils'
import { SettingsContext } from './SettingsProvider'

export interface ContainerProps {
  openModal: (option: ModalOption) => void
  hideSourceOnDrag: boolean
}

export interface ContainerState {
  boxes: { [key: string]: { top: number; left: number; title: string } }
}

interface Box {
  top: number
  left: number
  combining: boolean,
  newCombining: boolean,
  loading: boolean,
  error: number,
  element: RecipeElement
}

export const DropContainer: FC<ContainerProps> = ({
  openModal,
  hideSourceOnDrag
}) => {
    const [elements, setElements] = useState<RecipeElement[]>([]);
    const { settings, setSettings } = useContext(SettingsContext)

    async function getAllRecipes() {
        const data = await window.RecipeAPI.getAllRecipes();

        if (data) {
          const namesUnique = [...new Set(data.map(item => item.result))];

          var formattedData: RecipeElement[] = [];
          for (var name of namesUnique) {
            const recipes = data.filter((item) => item.result === name);
            if (recipes.length === 0) {
              console.warn(`Invalid recipe data for name ${name}`)
            } else {
              formattedData.push({
                name: name,
                display: recipes[0].display,
                emoji: recipes[0].emoji,
                recipes: recipes
              })
            }
          }
          setElements(formattedData);
        }
    }

    async function refreshRecipes() {
        await getAllRecipes()
    }

    useEffect(() => {
        getAllRecipes();
    }, []);

    const [boxes, setBoxes] = useState<{
        [key: string]: Box
      }>({
        // a: {
        //   top: 20,
        //   left: 80,
        //   combining: false,
        //   newCombining: false,
        //   loading: false,
        //   error: 0,
        //   element: {
        //     name: 'fire',
        //     display: 'Fire',
        //     emoji: '🔥',
        //     recipes: [{
        //       a: '',
        //       b: '',
        //       result: 'fire',
        //       display: 'Fire',
        //       emoji: '🔥',
        //       depth: 0,
        //       who_discovered: '',
        //       base: 1
        //     }]
        //   }
        // }
      })

      const mergeState = async <K extends keyof Box, T extends Box[K]>(a: string, b: string | undefined, state: K, value: T) => {
        if (b === undefined) {
          setBoxes((boxes) => {
            if (hasProp(boxes, a)) {
              return update(boxes, {
                [a]: {
                  $merge: { [state]: value },
                },
              })
            }
            return boxes
          })
        } else {
          setBoxes((boxes) => {
            if (hasProp(boxes, a) && hasProp(boxes, b)) {
              return update(boxes, {
                [a]: {
                  $merge: { [state]: value },
                },
                [b]: {
                  $merge: { [state]: value },
                },
              })
            }
            return boxes
          })
        }
      }

      const addError = async (a: string, b?: string) => {
        if (hasProp(boxes, a)) {
          if (b === undefined) {
            setBoxes((boxes) => {
              return update(boxes, {
                [a]: {
                  $apply: (v) => {
                    v.error += 1
                    return v
                  },
                },
              })
            })
          } else {
            if (hasProp(boxes, b)) {
              setBoxes((boxes) => {
                return update(boxes, {
                  [a]: {
                    $apply: (v) => {
                      v.error += 1
                      return v
                    },
                  },
                  [b]: {
                    $apply: (v) => {
                      v.error += 1
                      return v
                    },
                  },
                })
              })
            }
          }
        }
      }

    const combine = async (a: string, b: string) => {
        if (hasProp(boxes, a) && hasProp(boxes, b)) {
            console.log('combining...')
            console.log(boxes)
            try {
              try {
                mergeState(a, b, 'loading', true)
                try {
                  var recipe: Recipe | undefined = await window.RecipeAPI.combine(boxes[a].element.name, boxes[b].element.name)
                } catch (e) {
                  mergeState(a, b, 'loading', false)
                  addError(a, b)
                  console.error('Failed to run combine on the backend', e)
                  return
                }
                if (recipe === undefined) {
                  console.error('cant combine')
                } else {
                  console.log('combining')
                  console.log(recipe)
                  // TODO
                  var elementList = elements.filter((value) => value.name === recipe.result);
                  var recipes: Recipe[] = []
                  if (elementList.length === 0) {
                    console.log('No existing element found')
                    recipes.push(recipe)
                  } else {
                    if (elementList.length > 1) {
                      console.warn('Elements list is more than 1, it should only be 1')
                    }
                    var element = elementList[0]
                    recipes = element.recipes;
                    var recipeExists = false
                    for (var r of element.recipes) {
                      if ((r.a === recipe.a && r.b === recipe.b) || (r.a === recipe.b && r.b === recipe.a)) {
                        recipeExists = true
                        break
                      }
                    }
                    if (!recipeExists) {
                      recipes.push(recipe)
                    }
                  }
                  // let temp = update(boxes, {
                  //   [a]: {
                  //       $merge: {
                  //         element: {
                  //           name: recipe.result,
                  //           display: recipe.display,
                  //           emoji: recipe.emoji,
                  //           recipes: recipes
                  //         }
                  //       },
                  //   }
                  // })
                  // console.log(temp)
                  // delete temp[b]
                  // console.log(temp)
                  // setBoxes(temp)
                  setBoxes((boxes) => {
                    let temp = update(boxes, {
                      [a]: {
                          $merge: {
                            element: {
                              name: recipe.result,
                              display: recipe.display,
                              emoji: recipe.emoji,
                              recipes: recipes
                            }
                          },
                      }
                    })
                    delete temp[b]
                    return temp
                  })
                  refreshRecipes()
                }
              } catch(e) {
                elementControls.start('error')
                console.error('cant combine')
                console.error(e)
              }
            } catch(e) {
              mergeState(a, b, 'loading', false)
              addError(a, b)
              console.error('cant combine')
              console.error(e)
            }
            mergeState(a, b, 'loading', false)
        } else {
            console.error("One or more of the items doesn't exist anymore")
            throw("One or more of the items doesn't exist anymore")
        }
    }

    const [scope, animate] = useAnimate()

    const removeBox = (id: string) => {
      console.log(`Remove box ${id}`)
      if (hasProp(boxes, id)) {
        console.log('has box')
        // var temp = {...boxes};
        // delete temp[id]
        setBoxes((boxes) => {
          console.log('Setting for remove')
          var temp = {...boxes};
          delete temp[id]
          return temp
        })
      }
    }

    //const moveBox = useCallback(
    //  (id: string, left: number, top: number): Promise<void> => {
    //    return new Promise((resolve, reject) => {
    //      console.log(`moving ${id}`)
    //      setBoxes((boxes) => {
    //        return update(boxes, {
    //          [id]: {
    //            $merge: { left, top },
    //          },
    //        })
    //      })
    //      setBoxes((value) => {
    //        resolve()
    //        return value
    //      })
    //    })
    //  },
    //  [boxes, setBoxes],
    //)
    const moveBox = (id: string, left: number, top: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log(`moving ${id}`)
        setBoxes((boxes) => {
          console.log('MErging for move')
          return update(boxes, {
            [id]: {
              $merge: { left, top },
            },
          })
        })
        setBoxes((value) => {
          console.log('resolving for move')
          resolve()
          return value
        })
      })
    }

  const addBox = (x: number, y: number, element: RecipeElement, combining: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
      var newId = makeid(10)
      setBoxes((boxes) => {
        return {
          ...boxes,
          [newId]: {
              top: y,
              left: x,
              combining: combining,
              newCombining: false,
              loading: false,
              error: 0,
              element: element
          }
        }
      })
      setBoxes((value) => {
        resolve(newId)
        return value
      })
    });
  }

  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.ELEMENT, ItemTypes.SIDE_ELEMENT],
      drop(item: DragItem, monitor) {
        if (monitor.didDrop()) {
            return
        }
        let { x, y } = getXY(item, monitor)
        if (item.type === ItemTypes.SIDE_ELEMENT) {
            // Create a new and place it
            addBox(x, y, item.element, false)
        } else {
            // Moving an existing item
            moveBox(item.id, x, y)
        }
        return undefined
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [moveBox],
  )

  const onSettingsMouseEnter = () => {
    settingsControls.start('start')
  }

  const onSettingsMouseLeave = () => {
    settingsControls.start('reset')
  }

  const settingsVariants = {
    start: () => ({
      rotate: [0, 90],
      transition: {
        duration: 0.2,
        repeat: 0,
        ease: "easeInOut",
        repeatDelay: 0.5
      }
    }),
    reset: {
      rotate: [90, 0],
      transition: {
        duration: 0.2,
        repeat: 0,
        ease: "easeInOut"
      }
    }
  };
  
  const settingsControls = useAnimation();

  const elementVariants = {
    error: () => ({
      rotate: [0, -20, 20, -20, 20, 0],
      transition: {
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        duration: 0.5,
        repeat: 0,
        ease: "easeInOut",
        repeatDelay: 0.5
      },
    }),
    reset: {
      rotate: 0
    }
  };
  
  const elementControls = useAnimation();

 //style={styles}>
  return (
    <Split
        sizes={[75, 25]}
        className="split p-0 m-0"
        gutterSize={2}
        snapOffset={0}
    >
      <div>
        <div ref={drop} className='d-flex flex-column vh-100 h-100 w-100 overflow-hidden'>
          <AnimatePresence>
            {Object.keys(boxes).map((key) => {
              const { left, top, element, combining, newCombining, loading, error } = boxes[key]
              return (
                <motion.div
                  key={key}
                  custom={key}
                  variants={elementVariants}
                  animate={elementControls}
                  ref={scope}>
                  <MainElement
                    key={key}
                    id={`mainelement-${key}`}
                    dragId={key}
                    left={left}
                    top={top}
                    element={element}
                    combining={combining}
                    newCombine={newCombining}
                    loading={loading}
                    error={error}
                    hideSourceOnDrag={hideSourceOnDrag}
                    addBox={addBox}
                    moveBox={moveBox}
                    combine={combine}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
          <CustomDragLayer/>
          <div className='footer mt-auto'>
            <motion.div
              className='btn btn-no-outline float-end mb-2 me-2 fs-2 d-flex p-2'
              onMouseEnter={onSettingsMouseEnter}
              onMouseLeave={onSettingsMouseLeave}
              variants={settingsVariants}
              animate={settingsControls}
              onClick={() => openModal('settings')}>
                <IoSettingsOutline/>
            </motion.div>
            <a href="https://ko-fi.com/klutzybubbles" target="_blank" className='btn btn-sm btn-heart float-end mb-2 fs-2 d-flex p-2'><IoHeart /></a>
            <div className='btn btn-info float-end mb-2 fs-2 d-flex p-2' onClick={() => openModal('info')}><IoInformationCircleOutline /></div>
          </div>
        </div>
      </div>
      <SideContainer
        elements={elements}
        removeBox={removeBox}
        moveBox={moveBox}/>
    </Split>
  )
}

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
