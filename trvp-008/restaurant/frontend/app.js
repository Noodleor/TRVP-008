async function fetchMenus() {
  try {
    const response = await fetch('/menus');
    const menus = await response.json();

    const groupedMenus = menus.reduce((acc, menu) => {
      if (!acc[menu.day_of_week]) acc[menu.day_of_week] = [];
      acc[menu.day_of_week].push(menu);
      return acc;
    }, {});

    const menuListContainer = document.getElementById('menu-list');
    menuListContainer.innerHTML = '';

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    daysOfWeek.forEach(day => {
      const dayContainer = document.createElement('div');
      dayContainer.classList.add('day-container');

      const dayTitle = document.createElement('h3');
      dayTitle.textContent = day;
      dayContainer.appendChild(dayTitle);

      if (groupedMenus[day]) {
        groupedMenus[day].sort((a, b) => a.menu_number - b.menu_number);
        groupedMenus[day].forEach(menu => {
          const menuCard = document.createElement('div');
          menuCard.classList.add('menu-card');
          menuCard.setAttribute('data-menu-id', menu.id);
          menuCard.innerHTML = `
            <h3>Меню номер: ${menu.menu_number}</h3>
            <button class="delete-btn" data-id="${menu.id}">Удалить</button>
            <div class="dish-cards-container" id="dish-cards-container-${menu.id}"></div>
            <label for="dish-choice-${menu.id}">Добавить блюдо:</label>
            <select id="dish-choice-${menu.id}" class="dish-choice"></select>
            <button class="add-dish-btn" data-id="${menu.id}">Добавить блюдо</button>
            <div class="dish-cards-container" id="dish-cards-container-${menu.id}"></div>
          `;
          getDishesForMenu(menu.id);

          const deleteButton = menuCard.querySelector('.delete-btn');
          deleteButton.addEventListener('click', () => deleteMenu(menu.id, menuCard));

          const addDishButton = menuCard.querySelector('.add-dish-btn');
          addDishButton.addEventListener('click', () => addDishToMenu(menu.id));
          loadDishes(menu.id);

          menuListContainer.appendChild(dayContainer);
          dayContainer.appendChild(menuCard);
        });
      } else {
        const noMenuMessage = document.createElement('p');
        noMenuMessage.textContent = 'Меню не добавлено';
        dayContainer.appendChild(noMenuMessage);
      }
    });
  } catch (error) {
    console.error('Ошибка при получении меню:', error);
  }
}


async function deleteDishFromMenu(menuId, dishId, dishCard) {
  console.log("Hello");
  try {
    const response = await fetch(`/menu_dishes/${menuId}/${dishId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      const dayContainer = dishCard.closest('.day-container');
      dishCard.remove(); // Удаляем карточку из DOM

      // Показать уведомление об успешном удалении
      showNotification('Блюдо успешно удалено!', 'success');
    } else {
      throw new Error('Не удалось удалить Блюдо');
    }
  } catch (error) {
    console.error('Ошибка при удалении менюБлюдо:', error);
    showNotification('Ошибка при удалении менюБлюдо!', 'error');
  }
}




async function getDishesForMenu(menuId) {
  try {
    const response = await fetch(`/menu_dishes/${menuId}`);
    const dishes = await response.json();
    const dishCardsContainer = document.getElementById(`dish-cards-container-${menuId}`);
    dishCardsContainer.innerHTML = '';

    if (dishes.length > 0) {
      dishes.forEach(dish => {
        const dishCard = document.createElement('div');
        dishCard.classList.add('dish-card');
        dishCard.setAttribute('draggable', true);
        dishCard.setAttribute('data-dish-id', dish.id);
        dishCard.innerHTML = `
          <span class="dish-name">${dish.name}</span>
          <button class="delete-dish-btn" data-dish-id="${dish.id}">x</button>
        `;

        const deleteButton1 = dishCard.querySelector('.delete-dish-btn');
        deleteButton1.addEventListener('click', () => deleteDishFromMenu(menuId, dish.id, dishCard));

        dishCard.addEventListener('dragstart', (event) => {
          event.dataTransfer.setData('text/plain', dish.id);
          event.dataTransfer.setData('sourceMenuId', menuId);
        });

        dishCardsContainer.addEventListener('dragover', (event) => {
          event.preventDefault();
        });

        dishCardsContainer.addEventListener('drop', async (event) => {
          event.preventDefault();
          const dishId = event.dataTransfer.getData('text/plain');
          const sourceMenuId = event.dataTransfer.getData('sourceMenuId');
        
          if (sourceMenuId && menuId && dishId) {
            try {
              const response = await fetch(`/menu_dishes/move_dish/${dishId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sourceMenuId,
                  targetMenuId: menuId,
                }),
              });
        
              if (response.ok) {
                const dishCardElement = document.querySelector(`[data-dish-id="${dishId}"]`);
                if (dishCardElement) {
                  dishCardElement.parentNode.removeChild(dishCardElement);
                }
                dishCardsContainer.appendChild(dishCardElement);
              } else {
                const errorData = await response.json();
                showNotification('Блюдо этого типа уже есть в карточке меню', 'error');
                //alert(errorData.message);
                console.error('Ошибка при перемещении блюда:', errorData.message);
              }
            } catch (error) {
              console.error('Ошибка при перемещении блюда:', error);
            }
          }
        });
        

        dishCardsContainer.appendChild(dishCard);
      });
    } else {
      const noDishesMessage = document.createElement('p');
      noDishesMessage.textContent = 'Блюда пока не добавлены';
      dishCardsContainer.appendChild(noDishesMessage);
    }
  } catch (error) {
    console.error('Ошибка при загрузке блюд:', error);
  }
}


async function loadDishes(menuId) {
  try {
    const response = await fetch('/dishes');
    const dishes = await response.json();
    const dishSelect = document.getElementById(`dish-choice-${menuId}`);

    dishSelect.innerHTML = '';

    dishes.forEach(dish => {
      const option = document.createElement('option');
      option.value = dish.id;
      option.textContent = dish.name;
      dishSelect.appendChild(option);
    });

    const addDishButton = document.getElementById(`add-dish-btn-${menuId}`);
    addDishButton.addEventListener('click', () => {
      const selectedDishId = dishSelect.value;
      const selectedDish = dishes.find(dish => dish.id == selectedDishId);

      if (selectedDish) {
        const menuCard = document.querySelector(`#menu-card-${menuId}`);
        const category = 'Salad';
        addDishToMenuCard(menuCard, selectedDish, category);
      }
    });

  } catch (error) {
    console.error('Ошибка при загрузке блюд:', error);
  }
}



function addDishToMenuCard(menuCard, category, dish) {
  let categoryContainer = menuCard.querySelector(`.${category.toLowerCase()}-container`);

  if (!categoryContainer) {
      const newCategoryContainer = document.createElement('div');
      newCategoryContainer.classList.add(`${category.toLowerCase()}-container`);
      menuCard.appendChild(newCategoryContainer);
      categoryContainer = newCategoryContainer;
  }

  const dishCard = document.createElement('div');
  dishCard.classList.add('dish-card');
  dishCard.textContent = dish.name;
  categoryContainer.appendChild(dishCard);
}


async function addDishToMenu(menuId) {
  const dishSelect = document.getElementById(`dish-choice-${menuId}`);
  const selectedDishId = dishSelect.value;

  if (!selectedDishId) {
    alert('Пожалуйста, выберите блюдо.');
    return;
  }

  try {
    const response = await fetch(`/menu_dishes/${menuId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dish_id: selectedDishId })
    });

    if (response.ok) {
      console.log('Блюдо добавлено в меню');
      fetchMenus(); // Перезагружаем меню
    } else {
      const errorData = await response.json();
      console.error('Ошибка при добавлении блюда в меню:', errorData);
      showNotification('Ошибка при добавлении блюда в меню', true);
    }
  } catch (error) {
    console.error('Ошибка при добавлении блюда в меню:', error);
    showNotification('Ошибка при добавлении блюда в меню', true);
  }
}


function createDishElement(dish) {
  const dishElement = document.createElement('div');
  dishElement.classList.add('dish-item');
  dishElement.innerHTML = `
    <span>${dish.name}</span>
    <button class="delete-dish-btn">✖</button>
  `;

  const deleteDishButton = dishElement.querySelector('.delete-dish-btn');
  deleteDishButton.addEventListener('click', () => deleteDish(dish.id));

  return dishElement;
}


async function deleteDish(dishId) {
  try {
    const response = await fetch(`/menu_dishes/${dishId}`, { method: 'DELETE' });

    if (response.ok) {
      console.log('Блюдо удалено');
      fetchMenus();
    } else {
      console.error('Ошибка при удалении блюда');
    }
  } catch (error) {
    console.error('Ошибка при удалении блюда:', error);
  }
}

async function fetchDishesForMenu(menuId) {
  try {
    const response = await fetch(`/menu_dishes/${menuId}`);

    if (response.ok) {
      const dishes = await response.json();
      console.log('Dishes for menu:', dishes);
      
      const menuCard = document.getElementById(`menu-card-${menuId}`);
      const categoryContainer = menuCard.querySelector('.dishes-container');
      categoryContainer.innerHTML = '';

      dishes.forEach(dish => {
        const dishElement = createDishElement(dish);
        categoryContainer.appendChild(dishElement);
      });
    } else {
      console.error('Ошибка при загрузке блюд для меню');
    }
  } catch (error) {
    console.error('Ошибка при загрузке блюд:', error);
  }
}


function getDayName(dayIndex) {
  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday", 
    "Friday", "Saturday", "Sunday"
  ];
  return days[dayIndex - 1];
}

async function deleteMenu(menuId, menuCard) {
  try {
    const response = await fetch(`/menus/${menuId}`, { method: 'DELETE' });

    if (response.ok) {
      const dayContainer = menuCard.closest('.day-container');
      menuCard.remove();

      const remainingCards = dayContainer.querySelectorAll('.menu-card');
      if (remainingCards.length === 0) {
        const noMenuMessage = document.createElement('p');
        noMenuMessage.textContent = 'Меню не добавлено';
        dayContainer.appendChild(noMenuMessage);
      }

      showNotification('Меню успешно удалено!', 'success');
    } else {
      throw new Error('Не удалось удалить меню');
    }
  } catch (error) {
    console.error('Ошибка при удалении меню:', error);
    showNotification('Ошибка при удалении меню!', 'error');
  }
}

document.getElementById('addMenuButton').addEventListener('click', () => {
  document.getElementById('addMenuModal').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('addMenuModal').style.display = 'none';
});

document.getElementById('addMenuForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const day_of_week = document.getElementById('day').value;
  const menu_number = document.getElementById('menu_number').value;

  try {
    const response = await fetch('/menus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ day_of_week, menu_number })
    });

    if (response.ok) {
      fetchMenus();
      document.getElementById('addMenuModal').style.display = 'none';
      showNotification('Меню добавлено успешно');
    } else {
      const errorData = await response.json();
      showNotification(errorData.message, true);
    }
  } catch (error) {
    console.error('Ошибка при добавлении меню:', error);
    showNotification('Ошибка при добавлении меню', true);
  }
});

function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  
  notificationMessage.textContent = message;

  if (isError) {
    notification.style.backgroundColor = '#dc3545';
  } else {
    notification.style.backgroundColor = '#28a745';
  }

  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

fetchMenus();
