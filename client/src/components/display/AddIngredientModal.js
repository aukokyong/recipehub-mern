import axios from "axios";
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const AddIngredientModal = (props) => {
  //   const [openIngredientModal, setOpenIngredientModal] = useState(false);
  const initialState = {
    ingredientName: "",
    units: [""],
    type: "",
  };
  const [formData, setFormData] = useState(initialState);
  const measurementUnits = ["", "tsp", "tbsp", "g", "ml", "clove", "packs"];

  const handleChange = (event) => {
    setFormData((state) => {
      return { ...state, [event.target.name]: event.target.value };
    });
  };

  const handleChangeUnit = (event, index) => {
    console.log(event.target.value);
    const selectedUnits = [...formData.units];
    selectedUnits[index] = event.target.value;
    console.log("units", selectedUnits);
    setFormData((state) => {
      return { ...state, units: selectedUnits };
    });
  };

  const addUnits = () => {
    const selectedUnits = [...formData.units, ""];
    setFormData((state) => {
      return { ...state, units: selectedUnits };
    });
  };

  const removeUnits = (index) => {
    const selectedUnits = [...formData.units];
    selectedUnits.splice(index, 1);
    setFormData((state) => {
      return { ...state, units: selectedUnits };
    });
  };

  const handleCancel = () => {
    setFormData(initialState);
    props.onHide();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("axios call with", formData);
    axios
      .post("/ingredients/new", formData, { withCredentials: true })
      .then((response) => {
        setFormData({ ingredientName: "", units: [""] });
        props.availableIngredients.push(response.data);
        props.onHide();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Add Ingredient
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Please fill up all the empty fields</h4>
          <form onSubmit={handleSubmit}>
            <label htmlFor="ingredientName">Ingredient Name:</label> <br />
            <input
              type="text"
              id="ingredientName"
              name="ingredientName"
              value={formData.ingredientName}
              onChange={(event) => handleChange(event)}
              required={true}
            />
            <br />
            <label htmlFor="units">Measurement unit:</label>
            <br />
            {formData.units.map((unit, index) => {
              return (
                <>
                  <select
                    id="units"
                    name="units"
                    value={formData.units[index]}
                    onChange={(event) => handleChangeUnit(event, index)}
                    required={true}
                  >
                    {measurementUnits.map((unit) => {
                      return <option value={unit}>{unit}</option>;
                    })}
                  </select>
                  {index === formData.units.length - 1 && (
                    <Button onClick={() => addUnits()}>+</Button>
                  )}
                  {index !== formData.units.length - 1 && (
                    <Button onClick={() => removeUnits(index)}>-</Button>
                  )}
                  <br />
                </>
              );
            })}
            <br />
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="submit">Add</Button>
          </form>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>
  );
};

export default AddIngredientModal;

{
  /* <>
                  <input
                    type="text"
                    id="units"
                    name="units"
                    value={formData.units[index]}
                    onChange={(event) => handleChangeUnit(event, index)}
                    required={true}
                  ></input>
                  {index === formData.units.length - 1 && (
                    <Button onClick={() => addUnits()}>+</Button>
                  )}
                  {index !== formData.units.length - 1 && (
                    <Button onClick={() => removeUnits(index)}>-</Button>
                  )}
                  <br />
                </> */
}
