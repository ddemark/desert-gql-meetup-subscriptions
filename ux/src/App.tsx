import React, {useState} from 'react';
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import Examples from './examples';
import {MaybeScenario} from './types';
import {SCENARIOS} from './scenarios';

const App: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaybeScenario>(null);
  const toggle = () => setOpen(!isOpen);
  return (
    <React.Fragment>
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle caret>{(selectedItem && selectedItem.label) || `Choose A Scenario`}</DropdownToggle>
        <DropdownMenu>
          {
            SCENARIOS.map((scenario) =>
              <DropdownItem
                active={selectedItem === scenario}
                onClick={()=> setSelectedItem(scenario)}
              >{scenario.label}</DropdownItem>
            )
          }
        </DropdownMenu>
      </Dropdown>
      <hr />
      <Examples scenario={selectedItem}/>
    </React.Fragment>
  );
}

export default App;
