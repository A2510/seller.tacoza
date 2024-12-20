"use client";
import React, { createContext, useState, useContext } from "react";
// Import actions
import { addItem } from "@/app/features/menu/server/actions/addItem";
import { updateItem } from "@/app/features/menu/server/actions/updateItem";
// hooks
import { useToast } from "@/hooks/use-toast";
// Create the context
const MenuContext = createContext();

// Create a custom hook to use the MenuContext
export const useMenuContext = () => useContext(MenuContext);

// Context provider component
export const MenuProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]); // To manage all menu items
  const [addonItems, setAddonItems] = useState([]); // Manage addon items
  const { toast } = useToast();

  const handleAddItem = (type = "menu") => {
    setSelectedItem({
      name: "",
      food_category: "",
      price: "",
      description: "",
      type: type || "menu",
      mode: "add",
    });
  };

  // Function to handle item selection
  const handleItemClick = (item, type = "menu") => {
    setSelectedItem({
      ...item,
      type: type || "menu",
      mode: "edit",
    });
  };

  // Function to toggle item in stock status
  const toggleItemStockStatus = (() => {
    let timer;
    return (item) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await updateItem({
          slug: item.slug,
          in_stock: !item.in_stock,
        });
      }, 300); // 300ms debounce delay
    };
  })();

  // Function to toggle item featured status
  const toggleItemFeaturedStatus = (() => {
    let timer;
    return (item) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        updateItem({
          slug: item.slug,
          featured: !item.featured,
        });
      }, 300); // 300ms debounce delay
    };
  })();

  // Function to save the edited item details
  const handleSave = (item, type = "menu") => {
    if (type === "menu") {
      console.log(item, "Updated Item");
      // addItem(item);
    } else {
      // Handle addon saving logic here
      setAddonItems((prevItems) =>
        prevItems.map((item) => (item.id === item.id ? item : item)),
      );
    }
    setSelectedItem(null); // Optionally reset selected item after saving
  };

  const handleUpdate = async (item, type = "menu") => {
    if (type === "menu") {
      const form = new FormData();
      form.append("name", item.name);
      form.append("food_type", item.food_type);
      form.append("food_category", item.food_category);
      form.append("food_subcategory", item.food_subcategory);
      form.append("description", item.description);
      form.append("slug", item.slug);
      form.append("price", item.price);
      form.append("image", item.image);
      const [error, response] = await updateItem(form);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error updating item",
        });
      } else {
        toast({
          variant: "success",
          title: "Item updated successfully",
        });
      }
    } else {
      // Handle addon saving logic here
      setAddonItems((prevItems) =>
        prevItems.map((item) => (item.id === item.id ? item : item)),
      );
    }
  };

  return (
    <MenuContext.Provider
      value={{
        selectedItem,
        handleItemClick,
        handleAddItem,
        toggleItemStockStatus,
        toggleItemFeaturedStatus,
        handleSave,
        handleUpdate,
        menuItems,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
