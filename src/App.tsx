import React from "react";
import { ChangeEvent } from "react";
import { useState } from "react";
import {
  createStyles,
  Paper,
  Text,
  Button,
  Modal,
  TextInput,
  NumberInput,
  NativeSelect,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";

enum InputType {
  string = "string",
  number = "number",
}

type InputTypeStrings = keyof typeof InputType;

type ValueType = number | string | undefined;

interface Param {
  id: number;
  name: string;
  type: InputType;
}

interface ParamValue {
  paramId: number;
  value: ValueType;
}

interface Color {
  colorId: number;
  value: string;
}

interface Model {
  paramValue: ParamValue[];
  colors: Color[];
}

interface Props {
  params: Param[];
  model: Model;
}

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    overflow: "hidden",
    transition: "transform 150ms ease, box-shadow 100ms ease",
    padding: theme.spacing.xl,
    paddingLeft: theme.spacing.xl * 2,
    width: "40vw",
    margin: "5rem auto",

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.02)",
    },

    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 6,
      backgroundImage: theme.fn.linearGradient(
        0,
        theme.colors.pink[6],
        theme.colors.orange[6]
      ),
    },
  },
}));

const defaultProps: Props = {
  params: [],
  model: {
    paramValue: [],
    colors: [],
  },
};

const defaultParameter: Param = {
  id: 0,
  name: "",
  type: InputType.string,
};

const ParamEditor: React.FC<{
  props: Props;
  setProps: (props: Props) => void;
}> = ({ props, setProps }) => {
  function inputType(item: Param) {
    const inputText = (
      <TextInput
        placeholder={`Enter ${item.type}`}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value, item.id)
        }
      />
    );

    const inputNumber = (
      <NumberInput
        placeholder={`Enter ${item.type}`}
        onChange={(value) => handleChange(value, item.id)}
      />
    );

    switch (item.type) {
      case InputType.string:
        return inputText;
        break;
      case InputType.number:
        return inputNumber;
        break;
      // ...
    }
  }

  function handleChange(value: ValueType, id: number) {
    const inputValue = props.model.paramValue.find(
      (model) => id === model.paramId
    );

    if (inputValue) {
      inputValue.value = value;
    } else {
      props.model.paramValue.push({
        paramId: id,
        value,
      });
    }

    setProps({ ...props });
  }

  function removeParam(id: number) {
    const newProps = {
      params: props.params.filter((item) => item.id !== id),
      model: {
        paramValue: props.model.paramValue.filter(
          (item) => item.paramId !== id
        ),
        colors: [],
      },
    };

    setProps(newProps);
  }

  return (
    <div>
      {props.params.length ? (
        <div>
          {props.params.map((item: Param) => (
            <Group mt={20} grow key={item.id}>
              <Text size="lg" color="dimmed">
                {item.name}
              </Text>
              {inputType(item)}
              <Button
                variant="outline"
                color="dark"
                onClick={() => removeParam(item.id)}
              >
                Delete
              </Button>
            </Group>
          ))}
        </div>
      ) : (
        <div>No parameters has been created</div>
      )}
    </div>
  );
};

const ModalEdit: React.FC<{
  opened: boolean;
  props: Props;
  setProps: (props: Props) => void;
  setOpened: (opened: boolean) => void;
}> = ({ props, setProps, opened, setOpened }) => {
  const [count, setCount] = useState<number>(0);
  const [parameter, setParameter] = useState<Param>(defaultParameter);

  const form = useForm({
    initialValues: { name: parameter.name },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  function handleSubmit() {
    setCount(count + 1);

    props.params.push({ ...parameter, id: count });

    setParameter({ id: 0, name: "", type: InputType.string });
    setProps({ ...props });
    setOpened(false);
  }

  function addParameterName(value: string) {
    setParameter({ ...parameter, name: value });
    form.setFieldValue("name", value);
  }

  return (
    <Modal
      centered
      opened={opened}
      onClose={() => setOpened(false)}
      title="Parameter editor"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          placeholder="Parameter"
          label="Enter parameter name"
          required
          mb={20}
          {...form.getInputProps("name")}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            addParameterName(e.target.value)
          }
        />
        <NativeSelect
          data={["string", "number"]}
          label="Select value type"
          placeholder="Value type"
          mb={20}
          onChange={(event) =>
            setParameter({
              ...parameter,
              type: InputType[event.currentTarget.value as InputTypeStrings],
            })
          }
        />
        <Button type="submit">Add</Button>
      </form>
    </Modal>
  );
};

const App = () => {
  const { classes } = useStyles();
  const [opened, setOpened] = useState<boolean>(false);
  const [props, setProps] = useState<Props>(defaultProps);

  function getModel(props: Props) {
    return JSON.stringify(props);
  }

  return (
    <Paper withBorder radius="lg" className={classes.card}>
      <Group position="apart">
        <Text size="xl" weight={500} mt="md">
          PRODUCT
        </Text>
        <Button
          variant="outline"
          color="dark"
          onClick={() => setOpened(true)}
          mt={20}
        >
          Edit
        </Button>
      </Group>
      <ParamEditor props={props} setProps={setProps} />
      <ModalEdit
        props={props}
        setProps={setProps}
        opened={opened}
        setOpened={setOpened}
      />
    </Paper>
  );
};

export default App;
