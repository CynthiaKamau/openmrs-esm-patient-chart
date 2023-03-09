import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HTSMLRiskScoreParams } from '../types';
import { WindowRef } from '../window-ref';
import { ConfigResourceService } from './config-resource.service';

@Injectable()
export class HTSMachineLearningResourceService {
  constructor(private http: HttpClient, private windowRef: WindowRef, private configResource: ConfigResourceService) { }

  public getHTSRiskScore(params: HTSMLRiskScoreParams) {
    console.log("age", params.age,"entryPoint", params.entryPoint,"everTested", params.everTested,"gender", params.gender,"isDisabled", params.isDisabled,"latestMaritalStatus", params.latestMaritalStatus,"monthsSinceLastTest", params.monthsSinceLastTest,".monthsSinceLastTestInt", params.monthsSinceLastTestInt,"populationType", params.populationType,"selfTested", params.selfTested,"tbScreening", params.tbScreening,"testStrategy", params.testStrategy)

    let predictionVariables = {
      AgeAtTest: params.age,
      MonthsSinceLastTest: params.monthsSinceLastTestInt > 0 ? params.monthsSinceLastTestInt : 0,
      GenderMale: params.gender == 'M' ? 1 : 0,
      GenderFemale: params.gender == 'F' ? 1 : 0,
      KeyPopulationTypeGP: 0,
      KeyPopulationTypeSW: 0,
      MaritalStatusMarried: 0,
      MaritalStatusDivorced: 0,
      MaritalStatusPolygamous: 0,
      MaritalStatusWidowed: 0,
      MaritalStatusSingle: 0,
      MaritalStatusMinor: 0,
      PatientDisabledNo: 0,
      PatientDisabledDisabled: 0,
      EverTestedForHIVYes: 0,
      EverTestedForHivNo: 0,
      ClientTestedAsIndividual: 0,
      ClientTestedAsCouple: 0,
      EntryPointVCT: 0,
      EntryPointOPD: 0,
      EntryPointMTC: 0,
      EntryPointIPD: 0,
      EntryPointMOBILE: 0,
      EntryPointOther: 0,
      EntryPointHB: 0,
      EntryPointPEDS: 0,
      EntryPointVMMC: 0,
      EntryPointTB: 0,
      EntryPointCCC: 0,
      EntryPointPNS: 0,
      TestingStrategyVCT: 0,
      TestingStrategyHB: 0,
      TestingStrategyMOBILE: 0,
      TestingStrategyHP: 0,
      TestingStrategyNP: 0,
      TBScreeningNoPresumedTB: 0,
      TBScreeningPresumedTB: 0,
      ClientSelfTestedNo: 0,
      ClientSelfTestedYes: 0
    };
    // convert marital status
    if (params.latestMaritalStatus == 5555) { // married monogamous
      predictionVariables.MaritalStatusMarried = 1;
    } else if (params.latestMaritalStatus == 159715) { // married polygamous
      predictionVariables.MaritalStatusPolygamous = 1;
    } else if (params.latestMaritalStatus == 1058) { // divorced
      predictionVariables.MaritalStatusDivorced = 1;
    } else if (params.latestMaritalStatus == 1059) { // widowed
      predictionVariables.MaritalStatusWidowed = 1;
    } else if (params.latestMaritalStatus == 1057) {
      predictionVariables.MaritalStatusSingle = 1;
    }

    if (params.age < 15) {
      predictionVariables.MaritalStatusMinor = 1;
    }

    // convert population type
    if (params.populationType == 164928) {
      predictionVariables.KeyPopulationTypeGP = 1;
    } else if (params.populationType == 164929) {
      predictionVariables.KeyPopulationTypeSW = 1;
    }
    // convert disability status
    if (params.isDisabled == 1066) {
      predictionVariables.PatientDisabledNo = 1;
    } else if (params.isDisabled == 1065) {
      predictionVariables.PatientDisabledDisabled = 1;
    }

    // convert ever tested for hiv status
    if (params.everTested == 1065) {
      predictionVariables.EverTestedForHIVYes = 1;
    } else if (params.everTested == 1066) {
      predictionVariables.EverTestedForHivNo = 1;
    }

    // converter for tested as i.e. individual, couple:
    if (params.testedAs == 164957) {
      predictionVariables.ClientTestedAsIndividual = 1;
    } else if (params.testedAs == 164958) {
      predictionVariables.ClientTestedAsCouple = 1;
    }


    // convert entry point

    if (params.entryPoint == 159940) { // VCT
      predictionVariables.EntryPointVCT = 1;
    } else if (params.entryPoint == 160542) { // OPD
      predictionVariables.EntryPointOPD = 1;
    } else if (params.entryPoint == 160456) { // Maternity
      predictionVariables.EntryPointMTC = 1;
    } else if (params.entryPoint == 5485) { // IPD
      predictionVariables.EntryPointIPD = 1;
    } else if (params.entryPoint == 159939) { // mobile
      predictionVariables.EntryPointMOBILE = 1;
    } else if (params.entryPoint == 159938) { // HB
      predictionVariables.EntryPointHB = 1;
    } else if (params.entryPoint == 162181) { // Paed
      predictionVariables.EntryPointPEDS = 1;
    } else if (params.entryPoint == 5622) { // Other
      predictionVariables.EntryPointOther = 1;
    } else if (params.entryPoint == 162223) { // vmmc
      predictionVariables.EntryPointVMMC = 1;
    } else if (params.entryPoint == 160541) { // tb
      predictionVariables.EntryPointTB = 1;
    }

    // convert strategy

    if (params.testStrategy == 159938) { // HB
      predictionVariables.TestingStrategyHB = 1;
    } else if (params.testStrategy == 159939) { // Mobile
      predictionVariables.TestingStrategyMOBILE = 1;
    } else if (params.testStrategy == 164163) { // HP
      predictionVariables.TestingStrategyHP = 1;
    } else if (params.testStrategy == 164953) { // NP
      predictionVariables.TestingStrategyNP = 1;
    } else if (params.testStrategy == 164954 || params.testStrategy == 164955) { // VCT
      predictionVariables.TestingStrategyVCT = 1;
    }

    // convert HIV self test
    if (params.selfTested == 1066) {
      predictionVariables.ClientSelfTestedNo = 1;
    } else if (params.selfTested == 1065) {
      predictionVariables.ClientSelfTestedYes = 1;
    }

    // convert TB screening
    if (params.tbScreening == 1660 || params.tbScreening == 160737) {
      predictionVariables.TBScreeningNoPresumedTB = 1;
    } else if (params.tbScreening == 142177 || params.tbScreening == 1111) {
      predictionVariables.TBScreeningPresumedTB = 1;
    }
    const mlFormattedDate = new Date().toISOString().slice(0,10); //YYYY-MM-DD
    const modelConfigs = {
      "modelId": "hts_xgb_1211_jan_2023",
      "encounterDate": mlFormattedDate,
      "facilityId": "",
      "debug": "true"
    }
    var mlScoringRequestPayload = {
      modelConfigs: modelConfigs,
      variableValues: predictionVariables
    }
    const url = `${this.configResource.getConfig().htsRiskEligibilityResourceUrl}`;
    const headers = { 'content-type': 'application/json'}  
    return this.http.post(`${this.windowRef.nativeWindow.openmrsBase}${url}`, mlScoringRequestPayload, {'headers':headers});
  }
}
