/*
 * Copyright (c) 2019-present Sonatype, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { RubyGemsPackage } from './RubyGemsPackage';
import { RubyGemsUtils } from './RubyGemsUtils';
import { RubyGemsCoordinate } from './RubyGemsCoordinate';
import { PackageDependencies } from "../PackageDependencies";
import { PackageDependenciesHelper } from "../PackageDependenciesHelper";
import { RequestService } from "../../services/RequestService";
import { ScanType } from "../../types/ScanType";
import { ComponentEntry } from "../../models/ComponentEntry";
import { ComponentRequestEntry } from "../../types/ComponentRequestEntry";
import { ComponentRequest } from "../../types/ComponentRequest";

export class RubyGemsDependencies implements PackageDependencies {
  Dependencies: Array<RubyGemsPackage> = [];
  CoordinatesToComponents: Map<string, ComponentEntry> = new Map<
    string,
    ComponentEntry
  >();
  RequestService: RequestService;

  constructor(private requestService: RequestService) {
    this.RequestService = this.requestService;
  }

  public async packageForIq(): Promise<any> {
    try {
      let rubyGemsUtils = new RubyGemsUtils();
      this.Dependencies = await rubyGemsUtils.getDependencyArray();
      Promise.resolve();
    }
    catch (e) {
      throw new TypeError(e);
    }
  }

  public CheckIfValid(): boolean {
    return PackageDependenciesHelper.checkIfValid('Gemfile.lock', 'rubygems');
  }

  public ConvertToComponentEntry(resultEntry: any): string {
    let coordinates = new RubyGemsCoordinate(resultEntry.component.componentIdentifier.coordinates.name, 
      resultEntry.component.componentIdentifier.coordinates.version);
    
    return coordinates.asCoordinates();
  }

  public convertToNexusFormat(): ComponentRequest {
    let comps = this.Dependencies.map(d => {
      let entry: ComponentRequestEntry = {
        componentIdentifier: {
          format: "gem",
          coordinates: {
            name: d.Name,
            version: d.Version
          }
        }
      }

      return entry;
    });

    return new ComponentRequest(comps);
  }

  public toComponentEntries(data: any): Array<ComponentEntry> {
    let components = new Array<ComponentEntry>();
    for (let entry of data.components) {
      let componentEntry = new ComponentEntry(
        entry.componentIdentifier.coordinates.name,
        entry.componentIdentifier.coordinates.version,
        "gem",
        ScanType.NexusIq
      );
      components.push(componentEntry);
      let coordinates = new RubyGemsCoordinate(
        entry.componentIdentifier.coordinates.name,
        entry.componentIdentifier.coordinates.version
      );
      this.CoordinatesToComponents.set(
        coordinates.asCoordinates(),
        componentEntry
      );
    }
    return components;
  }
}